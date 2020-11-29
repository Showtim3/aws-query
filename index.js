const { exec } = require("child_process");
const fs = require('fs');


const query = `aws configservice select-resource-config --expression "SELECT resourceId, configuration.imageId WHERE resourceType='AWS::EC2::Instance'"`;
const describeImagesQuery = `aws ec2 describe-images --image-ids `;
let sqlOutput = null;

const imageIds = [];

const getImagesFromAmis = () => {
    const awsCliCommand = describeImagesQuery + imageIds.join(' ');
    exec(awsCliCommand, (error, stdout, stderr) => {
        if (error) {
            console.log(`error2: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        let data = JSON.stringify(stdout);
        console.log('This is the data that is being written:');
        fs.writeFileSync('data.json', data);
    });

}
const extractImageIds = () => {
    const pattern = /imageId(.*)\"/g;
    const imgIdStrings = sqlOutput.match(pattern)
    for(let id in imgIdStrings) {
        if(imgIdStrings[id].length >= 38) {
            imageIds.push(`"` + imgIdStrings[id].slice(imgIdStrings[id].indexOf("ami"), 33) + `"`);
        }
    }
    getImagesFromAmis();
}

const main = () => {
    exec(query, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        sqlOutput = stdout;
        extractImageIds();
    });
}


main();
