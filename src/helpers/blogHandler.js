exports.smartTrim = function(str, length, delim, appendx){
    if (str.length <= length) { 
        return str
    }
    
    let trimedStr = str.substring(0, length + delim.length);

    let lastDelimIndex = trimedStr.lastIndexOf(delim);
    if (lastDelimIndex >= 0) {
        trimedStr = trimedStr.substring(0, lastDelimIndex);
    }

    if (trimedStr) {
        trimedStr += appendx;
    }

    return trimedStr;
}