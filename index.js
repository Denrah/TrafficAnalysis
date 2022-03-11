const fs = require("fs");
const moment = require('moment');

let data = fs.readFileSync("model.txt", "utf8");
let lines = data.split(/\r?\n/).filter(item => item.length > 0);
lines = lines.map(item => item.replace(/\s+/g,' '));
const inputData = lines.map(item => item.replace(",", "").split(" "));

let currentMeasureInput = fs.readFileSync("input.txt", "utf8");
currentMeasureInput = currentMeasureInput.replace(/\s+/g,' ');
const currentMeasure = currentMeasureInput.replace(",", "").split(" ");

const args = process.argv.slice(2)

if (args.length === 0) {
    console.log("Укажите параметр способа подсчета: --average или --dayBased");
} else if (args[0] === "--average") {
    averageCalculation();
} else if (args[0] === "--dayBased") {
    dayBasedCalculation();
} else {
    console.log("Способ подсчета должен быть --average или --dayBased");
}

function averageCalculation() {
    let times = [...(new Set(inputData.map(item => item[1])))];

    let averageValueByTime = times.map(time => {
        let filtredData = inputData.filter(item => item[1] === time);
    
        let currentSum = 0;
    
        for(let index = 0; index < filtredData.length; index++) {
            currentSum += Number(filtredData[index][5]);
        }
    
        return {
            time: time,
            value: currentSum / filtredData.length
        };
    });
    
    let firstIndex = averageValueByTime.findIndex(item => {
        return currentMeasure[1].split(":")[0] === item.time.split(":")[0]
    });
    
    let secondIndex = firstIndex + 1;
    if (secondIndex >= averageValueByTime.length) {
        secondIndex = 0;
    }
    
    let minutesOffset = Number(currentMeasure[1].split(":")[1]) / 60
    let referenceValue = averageValueByTime[firstIndex].value
    + (averageValueByTime[secondIndex].value - averageValueByTime[firstIndex].value) * minutesOffset
    
    calculateResult(referenceValue);
}

function dayBasedCalculation() {
    let currentMeasureDate = moment(currentMeasure[0], "DD.MM.YYYY");

    let referenceDay = inputData.filter(item => {
        let date = moment(item[0], "DD.MM.YYYY");
        return date.day() == currentMeasureDate.day();
    });

    let firstIndex = referenceDay.findIndex(item => {
        return currentMeasure[1].split(":")[0] === item[1].split(":")[0]
    });
    
    let secondIndex = firstIndex + 1;
    if (secondIndex >= referenceDay.length) {
        secondIndex = 0;
    }
    
    let minutesOffset = Number(currentMeasure[1].split(":")[1]) / 60
    let referenceValue = Number(referenceDay[firstIndex][5])
    + (Number(referenceDay[secondIndex][5]) - Number(referenceDay[firstIndex][5])) * minutesOffset
    
    calculateResult(referenceValue);
}

function calculateResult(referenceValue) {
    if (Number(currentMeasure[5]) > referenceValue * 1.3) {
        console.log("Трафик выше нормы");
    } else if (Number(currentMeasure[5]) < referenceValue * 0.9) {
        console.log("Трафик ниже нормы");
    } else {
        console.log("Трафик в норме");
    }
}