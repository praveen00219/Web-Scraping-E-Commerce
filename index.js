const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const xlsx = require('xlsx');
const scrap = async()=>{
    const req = await axios.get('https://sale.alibaba.com/p/dd1yk6uah/index.html?spm=a2700.product_home_newuser.scenario_overview.bestSellers&wx_navbar_transparent=true&path=/p/dd1yk6uah/index.html&ncms_spm=a27aq.27910267&prefetchKey=met&wx_xpage=true&topOfferIds=1600582299649',{
        headers: {
            "content-type": 'text/html',
        }
    })

    const data = req.data;
    fs.writeFile('products.txt',data,(er)=>{
        if(er) {
            console.log(er);
            return;
        }
        else {
            console.log('File saved successfully');
        }
    })
}
scrap();

const products = [];
fs.readFile('products.txt', 'utf-8',(er,data)=>{
    if(er) {
        console.log(er);
        return;
    }
    else {
        const $ = cheerio.load(data);
        const productCards = $('.hugo4-pc-grid-item');
        $(productCards).each((i,item)=>{
            const title = $(item).find('.hugo4-product-element.subject.hugo3-util-ellipsis.line-2.subject-pc.field-margin-bottom.hugo3-fz-default').text().split('\n').join('').trim();
            
            const price = $(item).find('.hugo3-util-ellipsis.line-2.hugo3-fc-high.hugo3-fw-heavy.hugo3-fz-medium').text().split('\n').join('').trim();

            const discount = $(item).find('.discount.discount-pc.hugo3-fc-high.hugo3-fw-default').text().split('\n').join('').trim();

            const available = $(item).find('.hugo4-product-element.hugo4-product-sales.hugo3-util-ellipsis.pc.hugo3-fc-light>.hugo3-common-style-pc').text().split('\n').join('').trim();

            let obj = {
                title: title,
                price: price,
                discount: discount,
                available: available,
            }
            products.push(obj);
            const prod = `\ntitle: ${title}\nprice: ${price}\ndiscount: ${discount}\navailability: ${available}\n`;  
            fs.appendFile('productsData.txt',prod,(er)=>{
            if(er) {
                console.log(er);
                return;
            }
            else {
                console.log('File saved successfully');
            }
        });
        });
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(products);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'productsDetails.xlsx');
        xlsx.writeFile(workbook, 'productDetails.xlsx');
    }
});

