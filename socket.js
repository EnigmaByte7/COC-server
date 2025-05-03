const redis = require("redis");
const { Server } = require("socket.io");
const client = redis.createClient();
const cloneclient = client.duplicate();
const notify= require("./notifier");

async function redisInit() {
    await client.connect();
    await cloneclient.connect();
    
    //await cloneclient.CONFIG_SET("notify-keyspace-events", "KEA"); not working.... have to recheck
}

redisInit();

client.on("connect", () => console.log("Redis Connected!"));

function initSocket() {
    const io = new Server(9000, {
        cors: {
            origin: ["http://localhost:3000", "http://localhost:8000"],
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log(`connected: ${socket.id}`);
        socket.on("send", (msg) => {
            console.log(`Received message: ${msg}`);
        });
        socket.on("disconnect", async () => {
            console.log(`Client disconnected: ${socket.id}`);
            const mid = await client.get(`${socket.id}`)
            if(!mid) return;

            const sc1 = await client.hGet(`match:${mid}`, 's1');
            const sc2 = await client.hGet(`match:${mid}`, 's2');

            if(socket.id === sc1){
                //sc1 quit early
                client.hDel(`match:${String(mid)}`);
                client.hDel(`matchcopy:${String(mid)}`);
                client.del(`${String(sc1)}`)
                client.del(`${String(sc2)}`)
                notify(io, sc2, 'left')
            }
            else{
                //sc2 quit early
                client.hDel(`match:${String(mid)}`);
                client.hDel(`matchcopy:${String(mid)}`);
                client.del(`${String(sc2)}`)
                client.del(`${String(sc1)}`)
                notify(io, sc1, 'left') 
            }
        });
    });

    return io; 
}

module.exports = {initSocket, client, cloneclient};
