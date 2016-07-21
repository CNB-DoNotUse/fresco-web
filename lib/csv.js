const Promise = require('bluebird');

/**
 * Generates a CSV from passed array
 * @param  {array} data Array of data
 * @return {string} CSV string
 */
function generateCSV(array) {
    return new Promise((resolve, reject) => {
        if(array.constructor !== Array) {
            reject('Not a valid dataset', null);
        }

        console.log(array);

        let headers = Object.keys(array[0]);
        let output = '';

        //Loop through all the items in the data set
        array.forEach((item) => {
            const keys = Object.keys(item);
            let arr = [];

            //Loop through keys of object
            for (let key in item) {
                if (item.hasOwnProperty(key)) {
                    //Check if the field doesn't exist and push it in
                    if (headers.indexOf(key) === -1) 
                        headers.push(key);

                    arr[headers.indexOf(key)] = `"${item[key]}"`;
                }
            }

            //Join item separated by commas into CSV
            output += arr.join(',') + '\r\n';
        });

        output = headers.join(", ") + '\r\n' + output;

        resolve(output);
    });
}

module.exports = generateCSV;