const request = require('superagent')
const schedule = require('node-schedule')
const fs = require('fs')
require('superagent-proxy')(request)
const config = require('./config')

let allLessonMessage;//所有的课程列表
let activeIdOver = []; //已签到的活动id

//promise函数 同步执行 获取allLessonMessage; 并存起来 不用每次都发起请求
//这里用到了代理 因为我把项目放到了服务器 发现运行的时候返回了403.。。。应该是有ip识别 所以代理一下 只有这一个接口需要
function getAllLessonList(ip) {
    return new Promise((resolve, reject) => {
        if (config.cookie == '') {
            console.log('cookie无效，请执行getCookie文件获取cookie,粘贴到config文件中');
        } else {
            //获取课程信息
            request.get('http://mooc1-api.chaoxing.com/mycourse').proxy(`http://${ip}`).set('Cookie', config.cookie).end((err, res) => {
                if (err) {
                    reject('别问，问就是封号了。FROM：allLessonMessage');
                    fs.appendFile('log.txt','获取课程列表失败\r\n',err=>{
                        sendMsg('学习通错误信息', '获取课程列表失败，有可能cookie失效或不正确，来自阿里云签到');
                    })
                } else {
                    //console.log(JSON.parse(res.text).channelList);
                    //由于课程较多而且不能删除所以做了限制 减少损耗 提高性能 班级人数小于 config.number 人符合条件  filter 
                    //如不需要限制则删掉 .filter(r=> r.content.studentcount < config.number )
                    let data = JSON.parse(res.text).channelList.filter(r => r.content.studentcount < config.number).map(r => {
                        return {
                            tag: r.content.name,
                            classId: r.content.id,
                            name: r.content.course.data[0].name,
                            teacher: r.content.course.data[0].teacherfactor,
                            courseId: r.content.course.data[0].id,
                            taskUrl: `https://mobilelearn.chaoxing.com/ppt/activeAPI/taskactivelist?courseId=${r.content.course.data[0].id}&classId=${r.content.id}&uid=${config.UID}`
                        }
                    })
                    resolve(data)
                }
            });
        }
    })
}
async function getAllLessonMessage() {
    let ip = await getIp();
    allLessonMessage = await getAllLessonList(ip)
    console.log('cookie可用，已获取到所有课程列表')
}
getAllLessonMessage();

//获取代理ip
function getIp() {
    return new Promise((resolve, reject) => {
        request.get(`${config.api}`).end((err, res) => {
            if (err) {
                resolve('127.0.0.1')
            } else {
                console.log(res.text);
                resolve(res.text)
            }
        })
    })
}
//签到方法 判断activeIdOver数组里有没有此次要签的活动id 以防同个活动多次签到
function sign(taskListNeeded) {
    if (!activeIdOver.some(r => r == taskListNeeded[0].id)) {
        //通过万能签到链接签到 需要activeID classId fid couurseID
        request.get(`https://mobilelearn.chaoxing.com/widget/sign/pcStuSignController/preSign?activeId=${taskListNeeded[0].id}&classId=${taskListNeeded[0].classId}&fid=${config.fid}&courseId=${taskListNeeded[0].courseId}`).set('Cookie', config.cookie).end((err, res) => {
            if (err) {
                console.log('别问，问就是封了... FROM ：sign');
                sendMsg('学习通错误信息', '自动签到失败，cookie失效或不正确，来自阿里云签到');
            } else {
                let result = /<span class="greenColor">(.*?)<\/span>/.exec(res.text)[1];
                activeIdOver.push(taskListNeeded[0].id);//将成功签到的id放入数组，下次此id不再签
                fs.appendFile('log.txt', `${taskListNeeded[0].lesson} 发现签到活动，签到方式： ${taskListNeeded[0].nameOne} ,发布时间：${taskListNeeded[0].time}，自动签到结果：${result}\r\n`, err => {
                    console.log(`${taskListNeeded[0].lesson} 发现签到活动，签到方式： ${taskListNeeded[0].nameOne} ,发布时间：${taskListNeeded[0].time}，自动签到结果：${result}`);
                    sendMsg('学习通签到通知', `${taskListNeeded[0].lesson} 发现签到活动，签到方式： ${taskListNeeded[0].nameOne} ,发布时间：${taskListNeeded[0].time}，自动签到结果：${result}`);
                })
            }
        })
    } else {
        console.log('已成功签到 无需再签')
    }
}
// //发送通知到微信方法 serve酱
function sendMsg(texts, desps) {
    if (config.serve) {
        request.post(`https://sc.ftqq.com/${config.serve}.send`).send({ text: texts, desp: desps }).set('Content-type', 'application/x-www-form-urlencoded').end((err, res) => {
            if (err) {
                console.log('serve号不正确');
            }
        })
    }
}

//自动签到方法
function autoSign() {
    //所有的课程信息循环遍历拼接获取任务列表链接
    allLessonMessage.forEach(e => {
        request.get(e.taskUrl).set('Cookie', config.cookie).end((err, res) => {
            if (err) {
                fs.appendFile('log.txt',`访问${e.name}任务列表失败\r\n`,err=>{
                    console.log(`访问${e.name}任务列表失败`)
                })
            } else {
                //如果没有err 则表示已经取到任务数据 为了保险起见 不应该只取第一个任务 防止发送多个任务 而没有取到签到任务 取任务列表前三条
                //或者改变思路 筛选出列表中任务时间戳与当前时间戳相差小于 10*60*1000的 这样就拿到了10分钟之内发布的任务 如果为空则没有任务
                //  想法很好 但是 startTime  这个时间戳居然是请求时的时间戳  不过似乎只有作业任务的startTime为请求时间戳 签到类则为 发布时时间戳 似乎还是可行的 只需要再添加筛选条件 ractiveType == 2 也可以筛选出来
                // 考试/测试 签到  activeType  19  ||  45  || 2
                let taskListNeeded = JSON.parse(res.text).activeList.filter(r => {
                    r.lesson = e.name + '-' + e.teacher;
                    r.classId = e.classId;
                    r.courseId = e.classId;
                    r.time = new Date(r.startTime).toLocaleString();
                    return new Date().getTime() - r.startTime < config.time && r.activeType == 2 && r.status == 1
                })
                //判断筛选出来的符合签到条件的课程
                if (taskListNeeded.length > 0) {
                    sign(taskListNeeded);
                } else {
                    fs.appendFile('log.txt', `时间：${new Date().toLocaleString()} ， ${e.name + '-' + e.teacher} 没有签到任务\r\n`, err => {
                        console.log(`时间：${new Date().toLocaleString()} ， ${e.name + '-' + e.teacher} 没有签到任务`)
                    })
                }
            }
        })
    });
}

//根据自己课程定时 
//周一到周四早上8点到12点每5分钟执行一次 
let j = schedule.scheduleJob(`*/${config.speed} 8-12 * * 1-4`, () => {
    autoSign()
});
//周三到周五下午14点到18点没5分钟执行一次
let j2 = schedule.scheduleJob(`*/${config.speed} 14-18 * * 3-5`, () => {
    autoSign()
});