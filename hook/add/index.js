var GoogleSpreadsheet = require('google-spreadsheet'),
  async = require('async'),
  doc = new GoogleSpreadsheet('/* YOUR SHEET_ID */');

// setting lib path
process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT']

exports.handler = function(event, context) {
  var sheet;
  var match,
    videoId,
    videoUrl;

  if(match = /(http|https):\/\/(www.)?youtube.com(.*)v=([^\&^\n^\s]+)/i.exec(event.text)) {
    videoUrl = match[0];
    videoId = match[4];
  }

  if(match = /(http|https):\/\/(www.)?youtu.be\/([^\&^\"^\?^\n^\s]+)/i.exec(event.text)) {
    videoUrl = match[0];
    videoId = match[3];
  }

  if(!videoId) {
    context.succeed({
      "response_type": "ephemeral",
      "text": "유튜브 비디오만 틀 수 있어요.",
      "attachments": [{}]
    });
    return;
  }

  async.waterfall([
    function setAuth(done) {
      //var creds = require('../google-auth.json');
      var creds = {
        "private_key": "/* YOUR RPIVATE KEY */",
        "client_email": "/* YOUR CLIENT EMAIL */",
        "client_id": "/*YOUR CLIENT ID */"
      };
      doc.useServiceAccountAuth(creds, done);
    },
    function getInfoAndWorksheets(done) {
      doc.getInfo(function(err, info) {
        if(err) return done(err);

        console.log('Loaded doc: '+info.title+' by '+info.author.email);
        sheet = info.worksheets[0];
        console.log('sheet 1: '+sheet.title+' '+sheet.rowCount+'x'+sheet.colCount);
        done();
      });
    },
    function addRow(done) {
      var new_data = {
        type: 'youtube',
        info: videoId,
        url: 'https://youtu.be/'+videoId,
        createAt: new Date(),
        caster: event.user_name
      };

      sheet.addRow(new_data, function(err) {
        if(err) return done(err);
        done();
     });
    }
  ],function(err) {
    if(err) {
      context.succeed({
        "response_type": "ephemeral",
        "text": "처리 중 오류가 발생했습니다. "+err,
        "attachments": [{}]
      });
      return;
    }

    context.succeed({
      "response_type": "in_channel",
      "text" : "TV 재생 목록에 영상이 추가되었습니다.\nhttps://www.youtube.com/watch?v="+videoId,
      "attachments": [
        {
          "text": "캐스터 : @"+event.user_name,
        }
      ]
    });
  });
};
