// 使用账号密码登陆 获取cookie
const request = require('superagent');

request.post('http://i.chaoxing.com/vlogin?passWord=密码&userName=手机号&numcode=undefined&date=').set({

}).end((err,res)=>{
    if(err){
        console.log(err)
    }else{
        let str ='';
        res.headers['set-cookie'].forEach(r=>{
            str+=r
        })
        let cookie = str.replace(/Path=\//igs,'');
        console.log(cookie);
    }
})