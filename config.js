let cookie = '';
let config ={
    serve: 'serve酱密钥',  //serve酱服务 发送通知到微信 没有则不填 http://sc.ftqq.com/3.version
    cookie : cookie,//cokie 不用动
    UID : cookie=='' ? '' : /UID=(.*?);/.exec(cookie)[1], //uid 应该是userID 不用动
    fid : cookie=='' ? '' : /fid=(.*?);/.exec(cookie)[1], //fid 学校id  不用动
    //这里用到了代理 因为我把项目放到了服务器 发现运行的时候返回了403.。。。应该是有ip识别机制吧 只有一个请求被返回403 所以代理一下 本地运行则没事，接口就给嫖吧
    api:'http://api.xdaili.cn/xdaili-api//greatRecharge/getGreatIp?spiderId=a425b9cce46b4fcd9732fe5d6ecf2fa4&orderno=YZ20181046667n7qACJ&returnType=1&count=1',
    number : 90, //通过班级人数筛选掉不需要签到的课程 
    time : 10*60*1000, //当前时间的时间戳 - 发布时间的时间戳 < time  签到有效期 不需要修改
    speed: 5 //签到速度 分钟 每5分执行一次 越大越好 根据老师设置的签到时间 保证有效期内能运行两次 比如·10分钟有效期则 speed必须小于10  
}
module.exports = config