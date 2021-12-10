var dlurl = "https://www.dlsite.com/maniax/mypage/userbuy/=/type/all/start/all/sort/1/order/1/page/";
var lastPage = 1;
var result = new Object();
result.count = 0;
result.totalPrice = 0;
result.works = new Array();
result.genreCount = new Map();
result.makerCount = new Map();
result.eol = new Array();
var detailMode = true;

for(var i=1;i<=lastPage;i++){ // ページ走査    
    var doc = new DOMParser().parseFromString(fetchUrl(dlurl+i),"text/html");
    if(i==1){
        console.log(`取得中 ${i}ページ目`);
        var lastPageElm = doc.querySelector(".page_no ul li:last-child a");
        if(lastPageElm){
        lastPage = parseInt(lastPageElm.dataset.value);
        }
    }else{
        console.log(`取得中 ${i}/${lastPage}ページ目`);
    }
    var trElms = doc.querySelectorAll(".work_list_main tr:not(.item_name)");
    trElms.forEach(elm => { // 履歴の表の行走査
        var work = new Object();
        
        if(elm.querySelector(".work_name a")==null){
            work.url = "";
        }else{
            work.url = elm.querySelector(".work_name a").href;
        }

        work.date = elm.querySelector(".buy_date").innerText;
        work.name = elm.querySelector(".work_name").innerText.trim();
        work.genre = elm.querySelector(".work_genre span").textContent.trim();
        work.price = parseInt(elm.querySelector(".work_price").innerText.replace(/\D/g, ''));
        work.makerName = elm.querySelector(".maker_name").innerText.trim();

        if(detailMode&&work.url!=""){
            console.log(`取得中 ${work.url}`);
            var docWork = new DOMParser().parseFromString(fetchUrl(work.url),"text/html");
            work.mainGenre = new Array();
            docWork.querySelectorAll(".main_genre a").forEach(a => {
                var g = a.textContent;
                work.mainGenre.push(g);
                if(!(result.genreCount.has(g))){
                    result.genreCount.set(g, 0);
                }
                result.genreCount.set(g, result.genreCount.get(g)+1);
            });
        }

        if(!(result.makerCount.has(work.makerName))){
            result.makerCount.set(work.makerName, 0);
        }
        result.makerCount.set(work.makerName, result.makerCount.get(work.makerName)+1);

        result.count++;
        result.totalPrice += work.price;
        result.works.push(work);
        if(work.url==""){
            result.eol.push(work);
        }
    });
}

result.genreCount = new Map([...result.genreCount.entries()].sort(([, idA], [, idB]) =>  idB - idA));
result.makerCount = new Map([...result.makerCount.entries()].sort(([, idA], [, idB]) =>  idB - idA));

var genreRanking = "";
result.genreCount.forEach((value, key) =>{
    genreRanking += key + ":" + value + " ";
});

var makerRanking = "";
result.makerCount.forEach((value, key) =>{
    makerRanking += key + ":" + value + " ";
});

console.log(JSON.stringify(result));
console.log(`完了 作品数:${result.count} 合計金額:${result.totalPrice}`);
console.log("ジャンル 多かった順\n"+genreRanking);
console.log("サークル 多かった順\n"+makerRanking);


if(result.eol.length>0){
    var str=`販売終了作品数:${result.eol.length}\n`;
    result.eol.forEach(work => {
        str+=`${work.date} ${work.makerName} - ${work.name}\n`;
    });
    console.log(str);
}

function fetchUrl(url){
    var request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.withCredentials = true;
    request.send(null);
    return request.responseText;
}