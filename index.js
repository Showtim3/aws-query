const { exec } = require("child_process");
const fs = require('fs');


const query = `aws configservice select-resource-config --expression "SELECT resourceId, configuration.imageId WHERE resourceType='AWS::EC2::Instance'"`;
const describeImagesQuery = `aws ec2 describe-images --image-ids `;
let sqlOutput = `{
    "Results": [
        "{\\"resourceId\\":\\"i-029acb355c8917d74\\",\\"configuration\\":{\\"imageId\\":\\"ami-01b670d1a5b2c1da7\\"}}",
        "{\\"resourceId\\":\\"i-03b82779fe462787c\\",\\"configuration\\":{\\"imageId\\":\\"ami-00068cd7555f543d5\\"}}",
        "{\\"resourceId\\":\\"i-07fa1140460649c00\\",\\"configuration\\":{\\"imageId\\":\\"ami-0fc61db8544a617ed\\"}}",
        "{\\"resourceId\\":\\"i-09158213a63046a7b\\",\\"configuration\\":{\\"imageId\\":\\"ami-01b670d1a5b2c1da7\\"}}",
        "{\\"resourceId\\":\\"i-094cdfe5e2c6bba28\\",\\"configuration\\":{\\"imageId\\":\\"ami-00068cd7555f543d5\\"}}"
    ],
    "QueryInfo": {
        "SelectFields": [
            {
                "Name": "resourceId"
            },
            {
                "Name": "configuration.imageId"
            }
        ]
    }
}`;

const imageIds = [];

const getImagesFromAmis = () => {
    console.log(imageIds.join(''));
    const awsCliCommand = describeImagesQuery + imageIds.join('');
    exec(awsCliCommand, (error, stdout, stderr) => {
        if (error) {
            console.log(`error2: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log('Ran successfully');
        console.log(`stdout: ${stdout}`);
        let data = JSON.stringify(stdout);
        fs.writeFileSync('data.json', data);
    });

}
const extractImageIds = () => {
    const pattern = /imageId(.*)\"/g;
    const imgIdStrings = sqlOutput.match(pattern)
    for(let id in imgIdStrings) {
        if(imgIdStrings[id].length >= 38) {
            imageIds.push(`"` + imgIdStrings[id].slice(imgIdStrings[id].indexOf("ami"), 32) + `"`);
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
        console.log('Ran successfully');
        console.log(`stdout: ${stdout}`);
        sqlOutput = stdout;
        extractImageIds();
    });
}


extractImageIds();
