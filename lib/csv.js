/**
 * Generates a CSV from passed array
 * @param  {array} data Array of data
 * @return {string} CSV string
 */
function generateCSV(array) {
    const headers = Object.keys(array[0]);
    let output = headers.join(", ") + '\r\n';

    //Loop through all the items in the data set
    array.forEach((item) => {
        const keys = Object.keys(item);
        let arr = [];

        //Loop through keys of object
        for (let key in item) {
            if (item.hasOwnProperty(key)) {
                arr[headers.indexOf(key)] = `"${item[key]}"`;
            }
        }

        //Join item separated by commas into CSV
        output += arr.join(',') + '\r\n';
    });

    return output;
}

module.exports = generateCSV;