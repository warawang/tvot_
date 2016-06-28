var GoogleSpreadsheet = require('google-spreadsheet'),
  async = require('async'),
  ogs = require('open-graph-scraper'),
  doc = new GoogleSpreadsheet('');

// setting lib path
process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT']

exports.handler = function(event, context) {
  var sheet;
  var match,
    videoId,
    videoUrl,
    videoTitle;

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
    function getOg(done) {
      ogs({'url': videoUrl}, function (err, ogInfo) {
      	if(err) return done(err);

        videoTitle = ogInfo.data.ogTitle;
        done();
      });
    },
    function setAuth(done) {
      //var creds = require('../google-auth.json');
      var creds = {
        
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
      var newData = {
        type: 'youtube',
        info: videoId,
        subject: videoTitle,
        url: 'https://youtu.be/'+videoId,
        createAt: new Date(),
        caster: event.user_name
      };

      sheet.addRow(newData, function(err) {
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
