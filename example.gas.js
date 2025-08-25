// Example script for google apps script
function doPost(data) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const postBody = JSON.parse(data.postData.contents);
  if (postBody.type === 'V2') {
    if (postBody.batch) {
      // Make sure that there are enough rows
      const rowsLeft = sheet.getMaxRows() - sheet.getLastRow();
      if (rowsLeft - 10 < postBody.data.length) sheet.insertRowsAfter(sheet.getMaxRows(), postBody.data.length)
      const range = sheet.getRange(sheet.getLastRow() + 1,1, postBody.data.length,postBody.data[0].length)
      range.setValues(postBody.data);
    } else {
      sheet.appendRow(postBody.data)
    }
    return ContentService.createTextOutput('200 OK');
  }
  const {timestamp, userId, userTag, fields, userJoinDate} = postBody;
  sheet.appendRow([timestamp, userId, userTag, userJoinDate, ...fields])
  return ContentService.createTextOutput('200 OK');
}
