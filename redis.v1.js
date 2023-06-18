'use strict'
const express = require('express');
const { exists, get, incrby } = require('./model.redis');
const app = express();

app.get('/order', async (req, res) => {
    const time = Date.now()
    console.log('Time requested', time)

    // Giả sử số lượng hàng trong kho = 10

    const countProduct = 10

    // Giả sử sản phẩm là Iphone 14 Promax 128GB Đíp perble
     const keyName = 'Iphone14'

    // giả sử mỗi người chỉ mua được 1 sản phẩm

    const countOrderClient = 1

    // Số lượng đã bán ra, nếu chưa bán thì set = 0, còn nếu bán thì update + countOrderClient mỗi lần order thành công.

    const getKey = await exists(keyName)
    if(!getKey) {
        await set(keyName, 0)
    }

    // lấy số lượng bán ra

    let countSell = await get(keyName)
    console.log('Trước khi client order thành công thì số lượng bán ra là ===', countSell)
    const totalOrder = countSell + countOrderClient
//  order fail
    if(totalOrder > countProduct) {
        console.log('sold out')
        return  res.json({
            status: 'error',
            msg: 'sold out',
            time
        })
    }

    // order success

    countSell = await incrby(keyName, countOrderClient) // atom redis
    console.log('Sau khi client order thành công thì số lượng bán ra là ===', countSell)

    if (countSell > countProduct) {
        const moreSell = countSell - countProduct
        await set('ERROR-Iphone14', moreSell)
    }

    return res.json({
        status: 'success',
        msg: 'Ok',
        time
    })
})

app.listen( 3001, () => {
    console.log(`The server is running http://localhost:3001`);
})