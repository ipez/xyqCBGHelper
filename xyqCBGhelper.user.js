// ==UserScript==
// @name            梦幻西游藏宝阁助手
// @namespace       https://github.com/ipez/xyqCBGhelper
// @author          ipez
// @description     人物技能修炼花费计算
// @match           *://xyq.cbg.163.com/cgi-bin/query.py?*
// @require         http://cdn.bootcss.com/jquery/1.8.3/jquery.min.js
// @version         0.1
// @run-at          document-idle
// @license         MIT
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...

    var getMenpaiStr = document.getElementsByClassName('searchForm')[0].getElementsByTagName('th')[0].textContent;
    if(getMenpaiStr == "门派："){     //根据搜索框中的门派字样判断是否为人物页面
    	$(document).ready(function(){
        	var btn=$("<input type='button' id='helperBtn' class='btn1' value='计算'>");
        	$("input:button,.btn1").eq(2).after(btn);   
        	addBtnEvent("helperBtn");
    	});
    }

    function addBtnEvent(id){
        var iCalPrice = false; //判定是否已经输出结果
        $("#"+id).bind("click",function(){
            if(iCalPrice === false){
                newPriceList();
             iCalPrice = true;
            } 
            else{
                alert("计算已经完成");
            }
        });
    }

    // 刷新计算价格列表
    function newPriceList(){
        var list = document.getElementById('soldList').getElementsByTagName('tr');
        for (var i=0;i<list.length;i++){
            var price = calPrice(list[i]);
            addCalPrice(list[i],price);             
        }
    }

    // 角色售价末尾添加计算值
    function addCalPrice(role,price){
        var priceClass = ['p100','p1000','p10000','p100000','p1000000'];
        for (var i=0;i<priceClass.length;i++){
            var oldPrice=role.getElementsByClassName(priceClass[i]);
            if(oldPrice.length > 0){
                var newElement = document.createElement('span');
                for(var j=4;j>-1;j--){
                    if(price<Math.pow(10,j+2)) newElement.innerHTML = "<span class="+priceClass[j]+">【"+price.toFixed(2)+"】</span>";
                }
                oldPrice[0].parentNode.insertBefore(newElement, oldPrice[0].nextSibling); //售价后添加计算值 
                break; //添加价格后立即退出循环    
            }
        }
    }

    // 师门技能学习金钱消耗
    var schoolSkiGold = [6,12,19,28,38,51,67,86,110,139,174,216,266,325,393,472,563,667,786,919,1070,1238,1426,1636,1868,2124,2404,2714,3050,3420,3820,4255,4725,5234,5783,6374,7009,7690,8419,9199,10032,10920,11865,12871,13938,15070,16270,17540,18882,20299,21795,23371,25031,26777,28613,30541,32565,34687,36911,39240,41676,44224,46886,49666,52568,55595,58749,62036,65458,69019,72723,76574,80575,84730,89043,93518,98160,102971,107956,113119,118465,123998,129721,135640,141758,148080,154611,161355,168316,175500,182910,190551,198429,206548,214913,223529,232400,241533,250931,260599,270544,280770,291283,302087,313188,324592,336303,348328,360672,373339,386337,399671,413346,427368,441743,456477,471576,487045,502891,519120,535737,552749,570163,587984,606218,624873,643954,663468,683421,703819,724671,745981,767757,790005,812733,835947,859653,883860,908573,933799,959547,985822,1012633,1039986,1067888,1096347,1125371,1154965,1185139,1215900,2494508,2558419,2623549,2689914,2757527,4239607,4344845,4452027,4561177,4672319,450041,4594563,4680138,4766769,4854465,4943226,5033064,5123985,5215995,5309100,7204407,7331490,7460064,7590129,7721700,9818475,9986727,10156893,10328979,12252600];
    // 修炼所需经验，每点需金钱2w（法抗物抗）3w（攻法猎）
    var exptSkiGold = [15,21,29,39,51,65,81,99,119,141,165,191,219,249,281,315,351,389,429,471,515,561,609,659,711];

    // 角色技能修炼消耗计算
    function calPrice(role){
        var roleInfo = role.getElementsByTagName("textarea");//获得角色基本信息
        var roleObj = JSON.parse(roleInfo[0].value); //转换成对象
        
        //角色修炼  【gold储备金 money现金 rmb人民币】
        var exptGold = [30000, 20000, 30000, 20000, 30000]; // 攻 防 法 抗法 猎
        var exptSki=[roleObj.iExptSki1,roleObj.iExptSki2,roleObj.iExptSki3,roleObj.iExptSki4,roleObj.iExptSki5];
        var exptSkiGoldSum = 0;
        for(var i=0;i<5;i++) exptSkiGoldSum += exptSkiGold.sum(exptSki[i])*exptGold[i];
        //修炼上限
        //var exptSkiGoldMore = 0; 
        //for(var i=0;i<4;i++){
        //    switch(iMaxExpt[i]-20){
        //            case(0) 
        //
        //        };
         //   }
         
        //宠物修炼
        var xiuLianGuoMoney = 640000;  //修炼果单价
        var beastSki = [roleObj.iBeastSki1,roleObj.iBeastSki2,roleObj.iBeastSki3,roleObj.iBeastSki4];
        for(var SumExp=0,i=0;i<4;i++) SumExp += exptSkiGold.sum(beastSki[i]);
        var beastSkiMoney = Math.ceil(SumExp/15)*xiuLianGuoMoney;
        
        //角色师门
        var schoolSki = [];
        for(i=1;i<133;i++){
            if(typeof(roleObj.all_skills[i]) == "number"){
                var sn = schoolSki.push(roleObj.all_skills[i]<=180||180);//技能大于180的为符石加成不考虑，低等级的符石加成暂不处理。
                if(sn == 7)break;  //找到全部7个技能等级跳出循环
            }
        }

        var schoolSkiGoldSum = 0;
        for(i=0;i<7;i++) schoolSkiGoldSum += schoolSkiGold.sum(schoolSki[i]); 

        //返回金钱总消耗
        var gold2money = 0.8; 
        var money2rmb = 285.0/3000e4; //每三千万￥285
        var rmbPrice = ((exptSkiGoldSum+schoolSkiGoldSum)*gold2money+beastSkiMoney)*money2rmb;
        return rmbPrice;  

    }

    //数组前 n 项合
    Array.prototype.sum = function(n){
        for(var sum=0,i=0;i<n;i++) sum+=parseInt(this[i]);
        return sum ;
    };



})();
