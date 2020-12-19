import axios from 'axios'


console.log('hello jerry');
console.log('hello newman');

axios.get('https://httpbin.org/ip')
    .then((response) => {
        console.log(`Your IP is ${response.data.origin}`)
    })