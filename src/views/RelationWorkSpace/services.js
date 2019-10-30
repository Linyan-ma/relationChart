import axios from 'axios'

var getRelation = (id)=>{
    return axios.get(`./assets/example_id.json?id=${id}`)
}

export {
    getRelation
}