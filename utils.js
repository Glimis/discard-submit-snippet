var path = require('path'),
    fs = require('fs'),
    _=require('lodash');

function TemplateEngine(html, options) {
    var re = /<%([^%>]+)?%>/g, reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g, code = 'var r=[];\n', cursor = 0;
    var add = function(line, js) {
        js? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
            (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
        return add;
    }
    while(match = re.exec(html)) {
        add(html.slice(cursor, match.index))(match[1], true);
        cursor = match.index + match[0].length;
    }
    add(html.substr(cursor, html.length - cursor));
    code += 'return r.join("");';
    return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
}

//获取排列组合可能
function getGroup(config,rs){
    var rs=rs||[];
    var flag=true;
    config=_.cloneDeep(config);
    _.each(config,function(value,key){
        if(_.isArray(value)){
            flag=false;
             _.each(value,function(val){
                var obj={};
                obj[key]=val;
                getGroup(_.extend(_.extend(config,obj)),rs)
             })
        }
        return flag;
    })
    if(flag){
        rs.push(config);
    }
    return rs;
}

//修改快捷信息
function getTrigger(array){
   return _.map(array,function(obj){
        var rs={},names=[];
         for(var key in obj){
            var value=obj[key];
            if(_.isObject(value)){
                rs[key]=" "+value.code;
                rs[key+"Tr"]="-"+value.trigger;
            }else{
                rs[key]=" "+value.code;
                rs[key+"Tr"]="-"+value;
            }
         }
         return rs;
   })
}
//获取文件名
function getFileName(array){
   return _.map(array,function(obj){
         return _.map(obj).join('-');
   })
}

function getConfig(name){
    var data=fs.readFileSync( path.join(__dirname, name+'/config'),"utf-8");
    var data=JSON.parse(data);
    var group=getGroup(data);
    return {
        template:fs.readFileSync( path.join(__dirname, name+'/tpl'),"utf-8"),
        fileName:getFileName(group),
        group:getTrigger(group)
    }
}

function getFileName(config){
    console.log('config',config)
    return _.map(config,function(val){
        // console.log('val',val)
        return val;
    }).join('')
}

function exec(name){
    var data=getConfig(name);
    var template=data.template,
        group=data.group;
    _.each(group,function(config){
        var html=TemplateEngine(template,config);
        save('./'+name+'/snippet/'+getFileName(config)+'.sublime-snippet',html);
    })    
}

var save=fs.writeFile;
// function save(obj){
//     fs.writeFile(filename, data, [options], [callback(err)])
// }

module.exports={
    getConfig:getConfig,
    exec:exec
}