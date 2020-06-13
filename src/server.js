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
        amount: {
            all_max: 0,
            all_remain: 0,
            high_max: 0,
            high_remain: 0,
            normal_max: 0,
            normal_remain: 0
        },
        data: {
            all_max: [],
            all_remain: [],
            high_max: [],
            high_remain: [],
            normal_max: [],
            normal_remain: []
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
            returnData.amount.all_max = data.length
            returnData.data.all_max = data

            connection.query(`SELECT * FROM persons WHERE award_id_bonus = 0`, (err, data) => {
                if(err) {
                    console.log(err)
                    res.json({
                        code: '00401',
                        message: 'ไม่สามารถเข้าถึงฐานข้อมูล' // Access denied to DB or out of service
                    })
                } else {
                    returnData.amount.all_remain = data.length
                    returnData.data.all_remain = data

                    connection.query(`SELECT * FROM persons WHERE rank_level = 'high'`, (err, data) => {
                        if(err) {
                            console.log(err)
                            res.json({
                                code: '00401',
                                message: 'ไม่สามารถเข้าถึงฐานข้อมูล' // Access denied to DB or out of service
                            })
                        } else {
                            returnData.amount.high_max = data.length
                            returnData.data.high_max = data

                            connection.query(`SELECT * FROM persons WHERE rank_level = 'high' AND is_picked_up = 0`, (err, data) => {
                                if(err) {
                                    console.log(err)
                                    res.json({
                                        code: '00401',
                                        message: 'ไม่สามารถเข้าถึงฐานข้อมูล' // Access denied to DB or out of service
                                    })
                                } else {
                                    returnData.amount.high_remain = data.length
                                    returnData.data.high_remain = data

                                    connection.query(`SELECT * FROM persons WHERE rank_level = 'normal'`, (err, data) => {
                                        if(err) {
                                            console.log(err)
                                            res.json({
                                                code: '00401',
                                                message: 'ไม่สามารถเข้าถึงฐานข้อมูล' // Access denied to DB or out of service
                                            })
                                        } else {
                                            returnData.amount.normal_max = data.length
                                            returnData.data.normal_max = data

                                            connection.query(`SELECT * FROM persons WHERE rank_level = 'normal' AND is_picked_up = 0`, (err, data) => {
                                                if(err) {
                                                    console.log(err)
                                                    res.json({
                                                        code: '00401',
                                                        message: 'ไม่สามารถเข้าถึงฐานข้อมูล' // Access denied to DB or out of service
                                                    })
                                                } else {
                                                    returnData.amount.normal_remain = data.length
                                                    returnData.data.normal_remain = data

                                                    res.json({
                                                        code: '00200',
                                                        data: returnData
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})

app.get('/getawardslist', (req, res) => {
    let returnData = {
        amount: {
            awards_max: 0,
            awards_remain: 0,
            big_awards_max: 0
        },
        data: {
            awards_remain: [],
            awards_result: [],
            big_awards_result: []
        }
    }

    // รางวัลปกติ
    connection.query(`SELECT persons.id as person_id, persons.fullname as person_fullname, persons.award_id, awards.name as award_name FROM persons JOIN awards ON persons.award_id = awards.id where award_id > 0 ORDER BY persons.updated_date DESC`, (err, data) => {
        if(err) {
            console.log(err)
            res.json({
                code: '00401',
                message: 'ไม่สามารถเข้าถึงฐานข้อมูล' // Access denied to DB or out of service
            })
        } else {
            returnData.data.awards_result = data
            returnData.amount.awards_max = data.length

            // รางวัลใหญ่
            connection.query(`SELECT persons.id as person_id, persons.fullname as person_fullname, persons.award_id, persons.award_id_bonus, awards.name as award_name FROM persons JOIN awards ON persons.award_id_bonus = awards.id where persons.award_id_bonus > 0 ORDER BY persons.updated_date DESC`, (err, data) => {
                if(err) {
                    console.log(err)
                    res.json({
                        code: '00401',
                        message: 'ไม่สามารถเข้าถึงฐานข้อมูล' // Access denied to DB or out of service
                    })
                } else {
                    returnData.data.big_awards_result = data
                    returnData.amount.awards_max = returnData.amount.awards_max + data.length

                    returnData.amount.big_awards_max = data.length

                    // รางวัลที่รอการจับ
                    connection.query(`SELECT * FROM awards WHERE awards.id NOT IN (SELECT persons.award_id FROM persons WHERE persons.award_id > 0) AND awards.id NOT IN (SELECT persons.award_id_bonus FROM persons WHERE persons.award_id_bonus > 0)`, (err, data) => {
                        if(err) {
                            console.log(err)
                            res.json({
                                code: '00401',
                                message: 'ไม่สามารถเข้าถึงฐานข้อมูล' // Access denied to DB or out of service
                            })
                        } else {
                            returnData.amount.awards_remain = data.length
                            returnData.data.awards_remain = data
                            returnData.amount.awards_max = returnData.amount.awards_max + data.length

                            returnData.amount.big_awards_max = returnData.amount.big_awards_max + data.length

                            res.json({
                                code: '00200',
                                data: returnData
                            })
                        }
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
                    message: 'บันทึกไม่สำเร็จ' // ไม่มีการบันทึกข้อมูลเกิดขึ้น / บันทึกข้อมูลไม่ได้
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

app.post('/save/bonus-award', (req, res) => {
    const getBigAwardId = req.body.bigAwardId
    const getPersonId = req.body.personId

    connection.query(`UPDATE persons SET is_picked_up_bonus = 1, award_id_bonus = ${getBigAwardId} WHERE persons.id = ${getPersonId}`, (err, data) => {
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
                    message: 'บันทึกไม่สำเร็จ' // ไม่มีการบันทึกข้อมูลเกิดขึ้น / บันทึกข้อมูลไม่ได้
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

app.post('/save/disqualification', (req, res) => {
    const getAwardId = req.body.awardId
    const getPersonId = req.body.personId
    let fieldname = '' 

    if(req.body.option === 'bonus') {
        fieldname = 'award_id_bonus'
    } else {
        fieldname = 'award_id'
    }

    connection.query(`UPDATE persons SET ${fieldname} = 0 WHERE persons.id = ${getPersonId} AND ${fieldname} = ${getAwardId}`, (err, data) => {
        console.log(`UPDATE persons SET ${fieldname} = 0 WHERE persons.id = ${getPersonId} AND ${fieldname} = ${getAwardId}`)
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
                    message: 'บันทึกไม่สำเร็จ' // ไม่มีการบันทึกข้อมูลเกิดขึ้น / บันทึกข้อมูลไม่ได้
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