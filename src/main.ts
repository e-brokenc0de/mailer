// import { createTransport } from 'nodemailer'
// import { readFileSync, createReadStream } from 'fs'
// import { collect } from 'collect.js'
// import { default as async } from 'async'
// import { generate } from 'randomstring'

// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// ;(async () => {
//   const smtpList = readFileSync('smtp.txt', 'utf-8')
//   const smtpCollection = collect(smtpList.split('\n'))
//     .map((line) => line.trim().replace(/\r/, ''))
//     .map((list) => {
//       return {
//         user: list,
//         pass: '@@123Kontol',
//       }
//     })
//     .filter(({ user, pass }) => Boolean(user) && Boolean(pass))

//   const phoneList = readFileSync('50k.txt', 'utf-8')
//   const phoneCollection = collect(phoneList.split('\n')).map((line) =>
//     line.trim().replace(/\r/, ''),
//   )

//   const phoneChunkCollection = phoneCollection.chunk(smtpCollection.count())

//   let sentCount = 1

//   for (const phoneChunk of phoneChunkCollection.toArray()) {
//     for (const phoneKey in phoneChunk as string[]) {
//       const phone = phoneChunk[phoneKey]
//       const { user, pass } = smtpCollection.get(phoneKey)

//       const transporter = createTransport({
//         host: `mail.pakansariimpex.com`,
//         port: 465,
//         secure: true,
//         auth: { user, pass },
//       })

//       const tracking = `1Z${generate({
//         charset: 'numeric',
//         length: 2,
//       })}${generate({
//         charset: 'alphabetic',
//         length: 1,
//       }).toUpperCase()}${generate({ charset: 'numeric', length: 11 })}`

//       const shortlinks = [
//         'id04688.delivery',
//         'id33676.delivery',
//         'id91924.delivery',
//         'id95927.delivery',
//       ]

//       const shortlink = `https://ups-tracking-${generate({
//         charset: 'numeric',
//         length: 3,
//       })}.${collect(shortlinks).random()}`

//       const info = await transporter.sendMail({
//         from: {
//           name: `Package`,
//           address: user,
//         },
//         to: [`${phone}@mms.att.net`],
//         subject: `Okk`,
//         text: `Okk`,
//         attachments: [
//           // {
//           //   filename: `logo.png`,
//           //   content: createReadStream('kontol.png'),
//           // },
//           // {
//           //   filename: 'package1.txt',
//           //   content: new Buffer(
//           //     `Our driver can't find your address. We tried to deliver your parcel today, but you weren't in, or there was no safe place to leave it.`,
//           //     'utf-8',
//           //   ),
//           // },
//           // {
//           //   filename: 'package2.txt',
//           //   content: new Buffer(`\nTracking Number ${tracking}`, 'utf-8'),
//           // },
//           // {
//           //   filename: 'package3.txt',
//           //   content: new Buffer(
//           //     `\nPlease provide your complete address at ${shortlink} to schedule redelivery.`,
//           //     'utf-8',
//           //   ),
//           // },
//         ],
//       })

//       console.log(`${sentCount} ${phone} ${user} ${info?.messageId} - OK`)

//       sentCount++
//     }
//   }
// })()

import { readFileSync, createReadStream } from 'fs'
import { collect } from 'collect.js'
import { default as async } from 'async'
import { createTransport } from 'nodemailer'
import { generate } from 'randomstring'

const listCollection = collect(
  String(readFileSync('list.txt', 'utf-8')).split('\n'),
)
  .map((line: string) => line.trim().replace(/\r/, ''))
  .filter(Boolean)

const listArray = [...listCollection.toArray()] as string[]

const smtpCollection = collect(
  String(readFileSync('smtp.txt', 'utf-8')).split('\n'),
)
  .map((line: string) => line.trim().replace(/\r/, ''))
  .filter(Boolean)

const fromNames = collect(['Package', 'Undelivered'])
const subjects = collect(['Delivery failed'])
const messages = collect([readFileSync('./letter/1.html', 'utf-8')])
const shortlinks = collect([
  'id04688.delivery',
  'id33676.delivery',
  'id91924.delivery',
  'id95927.delivery',
])

let sentCount = 1

async.mapLimit(smtpCollection.toArray(), 10, async (smtp: string) => {
  const list = listArray.shift()

  if (!list) {
    return
  }

  const [user, pass] = smtp.split('|')

  // placeholder
  const shortlink = `https://${generate({ length: 10 })}.${shortlinks.random()}`
  const tracking = `1Z${generate({
    charset: 'numeric',
    length: 2,
  })}${generate({
    charset: 'alphabetic',
    length: 1,
  }).toUpperCase()}${generate({ charset: 'numeric', length: 11 })}`

  //
  const fromName = `${fromNames.random()}`
  const subject = `${subjects.random()}`
  const messageHtml = `${messages.random()}`
    .replace(/\{tracking\}/g, tracking)
    .replace(/\{shortlink\}/g, shortlink)

  const transporter = createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: { user, pass },
  })

  try {
    const info = await transporter.sendMail({
      from: { name: fromName, address: user },
      to: [list],
      subject,
      html: messageHtml,
    })

    console.log(`${sentCount} ${list} ${info?.messageId} ${user}`)
  } catch (e) {
    console.log(`${sentCount} ${list} ${e?.message}`)
  }

  sentCount++
})
