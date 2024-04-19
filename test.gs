function myFunction() {
//https://docs.google.com/spreadsheets/d/xxx/editのxxxの部分
//マスター
var masterSpreadSheetID = 'xxxxx';
//回答用
var answerSpreadSheetID = 'xxxxx';

// シート名
var masterSheetName = 'マスター';
var answerSheetName = '回答';

// 選択肢を動的にする質問のタイトル
var questionName = '車種';

// スプレッドシートIDでシートを取得
var masterSheets = SpreadsheetApp.openById(masterSpreadSheetID);
var masterSheet = masterSheets.getSheetByName(masterSheetName);

var answerSheets = SpreadsheetApp.openById(answerSpreadSheetID);
var answerSheet = answerSheets.getSheetByName(answerSheetName);

// マスターシートのA行の2行目から下の値を配列で取得
var sheetLastRow = masterSheet.getLastRow();
if (sheetLastRow > 1) {
  var candidate = masterSheet.getRange(2, 1, sheetLastRow - 1, 2).getValues();
} else {
  return;
}

// 回答シートの状況も取得（A行の2行目から）
var answerSheetLastRow = answerSheet.getLastRow();
if (answerSheetLastRow > 1) {
  var questionNames = answerSheet.getRange(1, 1, 1, answerSheet.getLastColumn()).getValues();
  var colCount = questionNames[0].indexOf(questionName);    
  var answerData = answerSheet.getRange(2, colCount + 1, answerSheetLastRow - 1).getValues();    
}

var form = FormApp.getActiveForm();
var items = form.getItems();

// 動的に選択肢を作成
items.forEach(function(item){
  if(item.getTitle() === questionName){
    var listItemQuestion = item.asMultipleChoiceItem();
    var choices = [];

    candidate.forEach(function(nameAndCapacity){        
      if(nameAndCapacity[0] != ""){
        // 定員が0(null) or 無回答 の場合は選択肢を表示
        if (answerData == null || nameAndCapacity[1] == 0 || nameAndCapacity[1] == ""){
          choices.push(listItemQuestion.createChoice(nameAndCapacity[0]));
        } else {
          var counter = 0;
          // 何人埋まってるか確認
          for(var i = 0; i < answerData.length; i++){
            if (nameAndCapacity[0] == answerData[i]){
              counter++;
            }
          }
          // 埋まってなければ選択肢を表示
          if (counter < nameAndCapacity[1]){
            choices.push(listItemQuestion.createChoice(nameAndCapacity[0]));
          }
        }      
      }
    });

    //選択肢の残数によってFormを受け付けるかどうか判断
    if (choices.length > 0) {
      // フォームの回答を受け付ける
      form.setAcceptingResponses(true);
      listItemQuestion.setChoices(choices);
    } else {
    // 回答受付終了
      form.setAcceptingResponses(false);        
    }
    return;
  }
});
}
