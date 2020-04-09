# 学习通自动签到Node.js

## 前言

昨天无意间看到一篇博客关于超星学习通自动签到的，是用python写的，[博客地址]('https://blog.csdn.net/weixin_43560272/article/details/104832461')，毕竟没有学过python，一脸蒙蔽，但是node学过一丢，于是照着他的思路，用nodeJs写了一下，代码写的有些乱，不过总是一丢丢成长的，特此记录，**纯属学习**。

## 如何使用

* Node环境  

``'javascript
克隆
git clone <https://github.com/rijianyunxi/autoSign.git>  ```  

```
```javascript

安装依赖
npm install

```  

```javascript

打开config.js,输入你的cookie
let cookie = '你的cookie'```  

```

* 在app.js里设置定时

```javascript

运行项目
node  app.js

```

## 不会抓包

```
打开getCookie.js,填写账号密码,复制终端上的内容到config.js的cookie中即可
node  getCookie.js
填完后运行项目
node app.js

```

## 定时任务

```javascript

//用的是node-schdule，根据自己课程进行定时
//周一到周四早上8点到12点每5分钟执行一次 
//参数含义（秒，分，时，日，月，周）
let j = schedule.scheduleJob(`*/${config.speed} 8-12 * * 1-4`, () => {
    autoSign()
});
//周三到周五下午14点到18点没5分钟执行一次
let j2 = schedule.scheduleJob(`*/${config.speed} 14-18 * * 3-5`, () => {
    autoSign()
});

```

## config.js配置

```javascript

let cookie = '你的cookie必填'
let config ={
    serve: '没有则不填，不能接受微信通知',  //serve酱服务 发送通知到微信 没有则不填 http://sc.ftqq.com/3.version
    cookie : cookie,//cokie
    UID : cookie=='' ? '' : /UID=(.*?);/.exec(cookie)[1], //uid 应该是userID
    fid : cookie=='' ? '' : /fid=(.*?);/.exec(cookie)[1], //fid 学校id
    //这里用到了代理 因为我把项目放到了服务器 发现运行的时候返回了403.。。。应该是有ip识别ip机制吧 只有一个请求被返回403 所以代理一下 本地运行则没事，接口就给嫖吧
    api:'http://api.xdaili.cn/xdaili-api//greatRecharge/getGreatIp?spiderId=a425b9cce46b4fcd9732fe5d6ecf2fa4&orderno=YZ20181046667n7qACJ&returnType=1&count=1',
    number : 90, //通过班级人数筛选掉不需要签到的课程 
    time : 10*60*1000, //当前时间的时间戳 - 发布时间的时间戳 < time  签到有效期 不需要修改,貌似这个参数根本没用 无视
    speed: 5 //签到速度 分钟 每5分执行一次 越大越好 根据老师设置的签到时间 保证有效期内能运行两次 比如·10分钟有效期则 speed必须小于10  
}

```

<!-- ### 获取课程接口 配合cookie post 请求

http://mooc1-api.chaoxing.com/mycourse

  
####  图形验证码接口
http://passport2.chaoxing.com/num/code?1586256648608

#### 登陆接口参数 numcode 为验证码
http://passport2.chaoxing.com/login?refer=http%3A%2F%2Fmooc1-api.chaoxing.com%2Fmycourse

refer_0x001=http%253A%252F%252Fmooc1-api.chaoxing.com%252Fmycourse&pid=-1&pidName=&fid=145&fidName=%E8%B6%85%E6%98%9F%E6%85%95%E8%AF%BE&allowJoin=0&isCheckNumCode=1&f=0&productid=&t=true&uname=15236775230&password=Yml1Yml1bC4%3D&numcode=2424&verCode=

#### 下发短信验证码接口

http://passport2.chaoxing.com/num/phonecode?phone=xxxxxxxx&needcode=false  GET

header必须refer 'Referer','http://passport2.chaoxing.com/wlogin?refer=http%3A%2F%2Fpay.chaoxing.com%2Findex.aspx'

#### 短信登陆接口

http://passport2.chaoxing.com/mylogin  POST  
参数 
msg: xxxxxx //手机号
vercode: xxxx //短信验证码

headers

Accept: application/json, text/javascript, */*; q=0.01
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
Connection: keep-alive
Content-Length: 28
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
Cookie: JSESSIONID=7C601C7A32A5DE3C9BABD2E2F38FD581; route=b2eda164bddd148142a54809ef404926
Host: passport2.chaoxing.com
Origin: http://passport2.chaoxing.com
Referer: http://passport2.chaoxing.com/wlogin?refer=http%3A%2F%2Fpay.chaoxing.com%2Findex.aspx
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36
X-Requested-With: XMLHttpRequest

  
## 万能签到链接

https://mobilelearn.chaoxing.com/widget/sign/pcStuSignController/preSign?activeId= xxx &classId= xxxx &fid= xxxxx &courseId=  xxxxx； -->
