module.exports = [
  {
    id: 1,
    statement: "Find the sum of all elements in an array.",
    driver: `#include <iostream>
using namespace std;
int sumArray(vector<int> arr, int n);
int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for(int i = 0; i < n; i++) cin >> arr[i];
    cout << sumArray(arr, n) << endl;
    return 0;
}`,
    placeholder: `int sumArray(vector<int> arr, int n) {
    // Your code here
}`,
    stdin: "5\n1 2 3 4 5",
    stdout: "15\n"
  },
  {
    id: 2,
    statement: "Reverse a string.",
    driver: `#include <iostream>
using namespace std;
string reverseString(string s);
int main() {
    string s;
    cin >> s;
    cout << reverseString(s) << endl;
    return 0;
}`,
    placeholder: `string reverseString(string s) {
    // Your code here
}`,
    stdin: "hello",
    stdout: "olleh\n"
  },
  {
    id: 3,
    statement: "Check if a number is prime.",
    driver: `#include <iostream>
using namespace std;
bool isPrime(int n);
int main() {
    int n;
    cin >> n; 
    cout << isPrime(n) << endl;
    return 0;
}`,
    placeholder: `bool isPrime(int n) {
    // Your code here
}`,
    stdin: "7",
    stdout: "1\n"
  },
  {
    id: 4,
    statement: "Find the factorial of a number.",
    driver: `#include <iostream>
using namespace std;
long long factorial(int n);
int main() {
    int n;
    cin >> n;
    cout << factorial(n) << endl;
    return 0;
}`,
    placeholder: `long long factorial(int n) {
    // Your code here
}`,
    stdin: "5",
    stdout: "120\n"
  },
  {
    id: 5,
    statement: "Find the nth Fibonacci number.",
    driver: `#include <iostream>
using namespace std;
int fibonacci(int n);
int main() {
    int n;
    cin >> n;
    cout << fibonacci(n) << endl;
    return 0;
}`,
    placeholder: `int fibonacci(int n) {
    // Your code here
}`,
    stdin: "10",
    stdout: "55\n"
  },
  {
    id: 6,
    statement: "Find the largest element in an array.",
    driver: `#include <iostream>
using namespace std;
int findMax(int arr[], int n);
int main() {
    int n;
    cin >> n;
    int arr[n];
    for(int i = 0; i < n; i++) cin >> arr[i];
    cout << findMax(arr, n) << endl;
    return 0;
}`,
    placeholder: `int findMax(int arr[], int n) {
    // Your code here
}`,
    stdin: "7\n1 9 10 11 8 7 3",
    stdout: "11\n"
  },
  {
    id: 7,
    statement: "Check if a string is a palindrome.",
    driver: `#include <iostream>
using namespace std;
bool isPalindrome(string s);
int main() {
    string s;
    cin >> s;
    cout << isPalindrome(s) << endl;
    return 0;
}`,
    placeholder: `bool isPalindrome(string s) {
    // Your code here
}`,
    stdin: "racecar",
    stdout: "1\n"
  },
  {
    id: 8,
    statement: "Merge two sorted arrays.",
    driver: `#include <iostream>
using namespace std;
void mergeArrays(int arr1[], int n1, int arr2[], int n2, int merged[]);
int main() {
    int n1, n2;
    cin >> n1;
    int arr1[n1];
    for(int i = 0; i < n1; i++) cin >> arr1[i];
    cin >> n2;
    int arr2[n2];
    for(int i = 0; i < n2; i++) cin >> arr2[i];
    int merged[n1 + n2];
    mergeArrays(arr1, n1, arr2, n2, merged);
    for(int i = 0; i < n1 + n2; i++) cout << merged[i] << " ";
    return 0;
}`,
    placeholder: `void mergeArrays(int arr1[], int n1, int arr2[], int n2, int merged[]) {
    // Your code here
}`,
    stdin: "3\n1 3 5\n3\n2 4 6",
    stdout: "1 2 3 4 5 6\n"
  },
  {
    id: 9,
    statement: "Find the missing number in an array of 1 to N.",
    driver: `#include <iostream>
using namespace std;
int findMissing(int arr[], int n);
int main() {
    int n;
    cin >> n;
    int arr[n-1];
    for(int i = 0; i < n - 1; i++) cin >> arr[i];
    cout << findMissing(arr, n) << endl;
    return 0;
}`,
    placeholder: `int findMissing(int arr[], int n) {
    // Your code here
}`,
    stdin: "5\n1 2 3 5",
    stdout: "4\n"
  },
  {
    id: 10,
    statement: "Sort an array using Bubble Sort.",
    driver: `#include <iostream>
using namespace std;
void bubbleSort(int arr[], int n);
int main() {
    int n;
    cin >> n;
    int arr[n];
    for(int i = 0; i < n; i++) cin >> arr[i];
    bubbleSort(arr, n);
    for(int i = 0; i < n; i++) cout << arr[i] << " ";
    return 0;
}`,
    placeholder: `void bubbleSort(int arr[], int n) {
    // Your code here
}`,
    stdin: "5\n5 1 4 2 8",
    stdout: "1 2 4 5 8\n"
  }
];
