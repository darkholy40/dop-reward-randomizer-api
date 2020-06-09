const express = require('express')
const cors = require('cors')
const mysql = require('mysql')

const app = express()
const PORT = process.env.PORT || 5010
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'qwaszx',
    database: 'dop_awards_randomizer'
})

// connection.connect((err) => {
//     err ? console.log(err) : console.log(connection)
// })

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

setInterval(() => {
    connection.query(`SELECT id FROM awards`, (err, data) => {
        console.log(new Date())
    })
}, 30000)

app.get('/getpersons', (req, res) => {
    let returnData = {
        max: 0,
        remain: 0,
        data: {
            remain: [],
            all: []
        }
    }

    connection.query(`SELECT * FROM persons`, (err, data) => {
        if(err) {
            console.log(err)
            res.json({
                code: '00401',
                message: 'ไม่สามารถเข้าถึงฐานข้อมูล' // Access denied to DB or out of service
            })
        } else {
            if(data.length === 0) {
                res.json({
                    code: '00404',
                    message: 'ไม่พบข้อมูล' // ไม่พบข้อมูล
                })
            } else {
                returnData.max = data.length
                returnData.data.all = data

                connection.query(`SELECT * FROM persons WHERE is_picked_up = 0`, (err, data) => {
                    if(err) {
                        console.log(err)
                        res.json({
                            code: '00401',
                            message: 'ไม่สามารถเข้าถึงฐานข้อมูล' // Access denied to DB or out of service
                        })
                    } else {
                        if(data.length === 0) {
                            res.json({
                                code: '00404',
                                message: 'ไม่พบข้อมูล' // ไม่พบข้อมูล
                            })
                        } else {
                            returnData.remain = data.length
                            returnData.data.remain = data

                            res.json({
                                code: '00200',
                                data: returnData
                            })
                        }
                    }
                })
            }
        }
    })
})

app.get('/getawardslist', (req, res) => {
    let returnData = {
        max: 0,
        remain: 0,
        data: {
            awards_remain: [],
            persons_whom_are_picked_up: []
        }
    }

    connection.query(`SELECT persons.fullname, persons.award_id, awards.name FROM persons JOIN awards ON persons.award_id = awards.id where award_id > 0 ORDER BY persons.award_id DESC`, (err, data) => {
        if(err) {
            console.log(err)
            res.json({
                code: '00401',
                message: 'ไม่สามารถเข้าถึงฐานข้อมูล' // Access denied to DB or out of service
            })
        } else {
            returnData.data.persons_whom_are_picked_up = data
            returnData.max = data.length

            // รางวัลที่รอการจับ
            connection.query(`SELECT * FROM awards WHERE id NOT IN (SELECT award_id FROM persons where award_id > 0)`, (err, data) => {
                if(err) {
                    console.log(err)
                    res.json({
                        code: '00401',
                        message: 'ไม่สามารถเข้าถึงฐานข้อมูล' // Access denied to DB or out of service
                    })
                } else {
                    returnData.remain = data.length
                    returnData.data.awards_remain = data
                    returnData.max = returnData.max + data.length

                    res.json({
                        code: '00200',
                        data: returnData
                    })
                }
            })
        }
    })
})

app.post('/save/pickedup-person', (req, res) => {
    const getAwardId = req.body.awardId
    const getPersonId = req.body.personId

    connection.query(`UPDATE persons SET is_picked_up = 1, award_id = ${getAwardId} WHERE persons.id = ${getPersonId}`, (err, data) => {
        if(err) {
            console.log(err)
            res.json({
                code: '00401',
                message: 'ไม่สามารถเข้าถึงฐานข้อมูล' // Access denied to DB or out of service
            })
        } else {
            if(data.length === 0) {
                res.json({
                    code: '00404',
                    message: 'ไม่พบข้อมูล' // ไม่พบข้อมูล
                })
            } else {
                res.json({
                    code: '00200',
                    data: data
                })
            }
        }
    })
})

app.listen(PORT, () => {
    console.log(`> Server is running on port : ${PORT}`)
})