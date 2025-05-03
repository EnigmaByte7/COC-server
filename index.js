//const nanoid = require("nanoid");
const express = require("express");
const notify = require("./notifier");
const cors = require("cors");
const {v4 : uuidv4} = require('uuid')
const {initSocket, client} = require("./socket");
const {cloneclient} = require('./socket')
//const { nanoid }  = require("nanoid");
const problems = require('./pool')
const io = initSocket(); 

const app = express();
const port = 8000;
const corsconfig = {
    origin: ["http://localhost:3000"]
};
app.use(cors(corsconfig));
app.use(express.json()); 

//plz activate keyspace evnts before use... config set notify-keyspace-events KEA

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.post("/test", async (req, res) => {
    const { sidb, pidb} = req.body; 
    //console.log(`id: ${sidb}`);

    const queue = "waiting";
    const len = await client.LLEN(queue);

    if (len >= 1) {
        const key = await client.RPOP(queue);

        const pida = key.split("~")[0];
        const sida = key.split("~")[1]
        if(pida == pidb) {
            res.send({ comment: "Try Again" });
            notify(io, sidb, 'Failed')
        }
        else{
            const uid = uuidv4();
            res.send({ comment: `Paired with ${pida}` });

            let nos = new Set();
            while (nos.size < 4) {
                nos.add(Math.floor(Math.random() * problems.length));
            }
            
            let arr = Array.from(nos);
            let qs = [];
            for (let i = 0; i < 4; i++) {
                qs.push(problems[arr[i]]);
            }
            console.log(qs)
            //pid : OK ~ mid ? qs
            
            notify(io, sidb, pidb + 'OPSINFO')
            notify(io, sida, pida + 'OPSINFO');//its notifying the existing player or the a player 

            notify(io, sida, pidb + ':' + 'OK' + '~' + uid + '?' + JSON.stringify(qs) )
            notify(io, sidb, pida + ':' + 'OK' + '~' + uid + '?' + JSON.stringify(qs) )

            await client.hSet(`match:${uid}`, {p1: pida, p2:  pidb, s1: sida, s2: sidb, sc1: 0, sc2: 0});
            await client.hSet(`matchcopy:${uid}`, {p1: pida, p2:  pidb, s1: sida, s2: sidb, sc1: 0, sc2: 0});
            await client.set(`${sida}`, `${uid}`)
            await client.set(`${sidb}`, `${uid}`)
            await client.expire(`match:${uid}`, 30);
        }
        
        return ;

    } else {
        const tosave = pidb + '~' + sidb; //pid(firebase doc id) ~ sid
        //console.log(tosave)
        await client.setEx(tosave, 20, '1');
        await client.LPUSH(queue, tosave);
        return res.send({ comment: "Try Again" });
    }
});

app.post('/verify', async (req, res) => {
    const mid = req.body.mid;
    console.log('mid', mid)
    const check = await client.exists(`match:${mid}`);
    let comment = 0;
    console.log('check', check)
    if(check == 1){
        comment = 1;
    }

    return res.send({comment : comment})
})

app.post('/submit', async (req, res) => {
    const { code, langid, stdin , qid, mid, sida, pid} = req.body;
    console.log('code', code)
    console.log('langid', langid)
    console.log('stdin', stdin)
    if (!code || !langid) {
      return res.status(400).json({ error: 'code and langid are required' });
    }
    console.log('match : ', mid, sida)
    const encodedCode = Buffer.from(code).toString('base64');
    const encodedStdin = Buffer.from(stdin || '').toString('base64');
  
    try {
      const judgeResponse = await fetch('http://localhost:2358/submissions?base64_encoded=true&wait=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_code: encodedCode,
          language_id: langid,
          stdin: encodedStdin || '',
          base64_encoded:true
        }),
      });
  
      const result = await judgeResponse.json();
      console.log(result);
      if(result.status.id == 3){
        console.log(pid);
        
        if(problems[qid].stdout == result.stdout){
            console.log('correct')
        }
        const pidd = String(pid);
        const qidd = String(qid);
        //had to add a set to ensure, user dont earn points on solving thr same question again
        //keeping the qids in a set and check with each call, if the qid is already there for that player
        //then dont give points for the question 
        let f = 0;
        const chk = await client.exists(pidd);
        if(chk == 1){
            const solved = await client.sMembers(pidd)
            console.log('solved', solved, qidd)
            if(solved.includes(qidd)){
                f = 1;
            }
            else{
                await client.sAdd(pidd, [qidd]);
            }
       }
        else{
            await client.sAdd(pidd, [qidd]);
        }

        let a = 0; //one more flag, coz why not
        const sid1 = await client.hGet(`match:${mid}`, 's1')
        const sid2 = await client.hGet(`match:${mid}`, 's2')
        console.log(sid1, sid2, sida)
        if(!f){
            if(sid1 == sida){ //means sida is the op, so notfy the op and opp
                console.log(sid1, sid2)
                const currpoint = await client.hGet(`match:${mid}`, 'sc1')
                console.log(currpoint);
                
                if(currpoint === "3"){
                    //play 1 has won
                    notify(io, sid1, 'won')
                    a = 1
                    notify(io, sid2, 'lose')
                }
                await client.hIncrBy(`match:${mid}`, 'sc1', 1);
                notify(io, sid1, 'correct:my')
                notify(io, sid2, 'correct:opp')

            }
            else{
                await client.hIncrBy(`match:${mid}`, 'sc2', 1);
                const currpoint = await client.hGet(`match:${mid}`, 'sc2')
                if(currpoint === "3"){
                    //play 1 has won
                    notify(io, sid2, 'won')
                    notify(io, sid1, 'lose')
                    a = 1
                }
                notify(io, sid2, 'correct:my')
                notify(io, sid1, 'correct:opp')

            }
        }
        if(a){
            client.hDel(`match:${String(mid)}`);
            client.hDel(`matchcopy:${String(mid)}`);
            client.del(`${String(sid1)}`)
            client.del(`${String(sid2)}`)
        }

      }
  
      res.json({
        stdout: result.stdout,
        stderr: result.stderr,
        compile_output: result.compile_output,
        status: result.status,
        time: result.time,
        memory: result.memory,
      });
  
    } catch (err) {
      console.error('Error communicating with Judge0:', err);
      res.status(500).json({ error: 'Failed to submit code for execution' });
    }

    //res.send({ comment: "ok" });
  });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

async function sub(){
    await cloneclient.pSubscribe(`__keyevent@0__:expired*`,  async (key, event) => {
        if(key.includes('~')){             
            console.log(`Event ${event} occured on channel ${key}`);
            const sid = key.split("~")[1]
            await client.del("waiting", key)
            notify(io, sid, 'alone')
        }
        if(key.includes('match')){
            console.log(`im here!!!!`);
            const mid =key.split(':')[1]
            const sc1 = parseInt(await client.hGet(`matchcopy:${mid}`, 'sc1'));
            const sc2 = parseInt(await client.hGet(`matchcopy:${mid}`, 'sc2')); 
            const sid1 = await client.hGet(`matchcopy:${mid}`, 's1')
            const sid2 = await client.hGet(`matchcopy:${mid}`, 's2')
            
            console.log(mid, sid1, sid2, sc1, sc2)
            //await client.hDel(`match:${mid}`);
            await client.hDel(String(`matchcopy:${mid}`));
            await client.del(`${sid1}`)
            await client.del(`${sid2}`)
            if(sc1 > sc2){
                notify(io, sid1, 'won')
                notify(io, sid2, 'lose')
            }
            else if(sc1 < sc2){
                notify(io, sid2, 'won')
                notify(io, sid1, 'lose')
            }
            else if(sc1 == sc2){
                notify(io, sid1, 'draw')
                notify(io, sid2, 'draw')
            }
        }
    })  
}
sub();