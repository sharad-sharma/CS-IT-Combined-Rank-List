const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const app = express();
const fs = require('fs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile('public/index.html');
});

let roll = 1;
const student = [];
// [CSA, CSB, ITA, ITB]
const branch = ['CSA', 'CSB', 'ITA', 'ITB'];
const br = ['c10', 'c11', 'i10', 'i11'];
const lm = [73, 74, 74, 74];
let br_location = 0;

const marks = () => {

try {
  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    if(roll < 10) {
      await page.goto(`http://results.ietdavv.edu.in/DisplayStudentResult?rollno=19${br[br_location]}0${roll}&typeOfStudent=Regular`);
    } else {
      await page.goto(`http://results.ietdavv.edu.in/DisplayStudentResult?rollno=19${br[br_location]}${roll}&typeOfStudent=Regular`);
    }

    // await page.pdf({path: `roll${roll}-csb.pdf`, format: 'A4'});

    // Get name of the student
    let [e1] = await page.$x("/html/body/table/tbody/tr/td/table[2]/tbody/tr[3]/td[2]/b");
    let text = await e1.getProperty('textContent');
    let name = await text.jsonValue();

    // Get result of the student
    let [e2] = await page.$x("/html/body/table/tbody/tr/td/table[4]/tbody/tr[2]/td[2]/b");
    let text2 = await e2.getProperty('textContent');
    let sgpa = await text2.jsonValue();

    // Get name of the student
    let [e3] = await page.$x("/html/body/table/tbody/tr/td/table[4]/tbody/tr[1]/td[2]/b");
    let text3 = await e3.getProperty('textContent');
    let pass = await text3.jsonValue();
  
    // Get the "viewport" of the page, as reported by the page.
    const dimensions = await page.evaluate(() => {
      return {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
        deviceScaleFactor: window.devicePixelRatio
      };
    });

    let profile = {
      name: name,
      sgpa: sgpa,
      pass: pass,
      branch: branch[br_location]
    }

    if(profile.pass == "Pass") {
      student.push(profile)
    }
    
    console.log('Dimensions:', dimensions);
    console.log(name, sgpa, roll);

    if(br_location == 2 && roll == 20) roll += 2;
    else if(br_location == 3 && roll == 24) roll +=2;
    else roll++;

    await browser.close();
  })();
} catch(err) {
  console.log(err);
}

  if(roll == lm[br_location]) {
    
    br_location++;
    roll = 1;
    
    if(br_location > 3) {
      clearInterval(myVar);
      student.sort(function (a, b) {
      return b.sgpa - a.sgpa;
      });    

      var logger = fs.createWriteStream('CS-IT Rank List.txt', {
        flags: 'a' // 'a' means appending (old data will be preserved)
      })
      
      let c = 1;
      student.map(x => {
        logger.write(`${c})  (${x.branch})  ${x.name}   ${x.sgpa} \n`)
        c++;
      })
      console.log(student);
    }
  }
    

}

let myVar = setInterval(marks, 3500);

app.listen(3000, () => console.log('server started'));
