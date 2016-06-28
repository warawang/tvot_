var GoogleSpreadsheet = require('google-spreadsheet'),
  async = require('async'),
  ogs = require('open-graph-scraper'),
  doc = new GoogleSpreadsheet('1HFX32QuaehqqoM9siwPa-Wcv6DiETlusxxfGj_8QIJY');

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
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCB4UHpkZfpBqAM\n3vx5gI0MVpbQXfxSt2EwcdoCVgscnLA6dZRMDy3elGadnw2bVrNrEEIBZ90xuOGe\niNZjrBudW/+UVGESUM1KRgcbWTmA7FWeWQHkpt1THcdIgP+Ocxw+1gNfMAnzVGfR\nMhOd1bfYAJs0CRd8e0KyINVQCKQiA+LE85xPkL9EWS7WM37KD8Jr3t3VUYpDw6Vv\nAXAYZQ1Gt9A39XcqyS0QAW2RdOEDn+RKoB1QifYJEcx5P0ZVrHYasIRMO96bkQ08\na13TBv26UEvXNGbRIUv1x+d5XamBeI3QgOBa8hrdqRA+LMG/yt/GWnPaLSD7yDsj\nA8IcNlszAgMBAAECggEAbVMsBSxNf5PZExx7ztZ7Y8BbMEd8hi/f+kRLax38OnhW\nCs9AJgm85ZdrDRB+BpyjZ+KGfOJtmVXzbFvognuzvvBaoQOpth4Xv4ZUoxumwLOu\nmhx38HzY3ga54XjcJI8WXnoM2on4Rj9tJ/UL+BaWqpZQDiv8/gZPLNtgUv8DEbGQ\ntri0wmH1Nl/oudZIXRNkHcC72+sVzpRcHB0aiA8oMrCbHXw4egUUX/mT3CIGQAja\n3lvjtiZhJwq7yhZ0ZQBdYHXDHUJz8tbQLz4kw4u1hB6UJJX+rK4UitrkTFXu3GQv\nWcYSwdJDXsXwcX3JBbFxQclmYkWpHL/ZLQ5f0AxLSQKBgQDrGVBIIzgvWrrjDxI0\nM3AzG4XvdecVsKtpadIy9RWOYexaOWAhNYl30JgJuhHCwq+a+hHpQlOCL/VCG5zt\nDms1bZdxzNfHnewDJWuKopyNm2UikHl2QxcglR9TX29gbr0fKLKWK/yCGHRw+M3F\nuKfScuIHCZL8uSn4irKjfmbUDQKBgQCNbTvMhKKXXSaXNS2BKkLfK0YuIJFxSTOE\no6DbWsbWX/U0SGZydHgOqIkzxm5OENQrVwL/i/Mxz2BAqzlpqFoOFbvsSWBJxZPp\nJ7MLui81m6KJ9VGyyiaevTfnSb34k04YgKRB1w+r6akuACoTCKu6WcPCmSo+wZvq\nvmjBQSHcPwKBgQCy8oWlIwm1Ib527hXRHgYdIKoF5xyJ6fvPNPkGSH6r7eVVl66Q\nGIwWYvQXE0ZJlJ7Nu+K+RfoCcjagpxv/ZKY9+Lj5qg3kp1Pp4SXGVJgNQWbttEJ/\nvflwl5FMiKviHuhdO0EUBU8iRzL6eqdGBJPZIBDjgmoba2WDBS+MOr5SUQKBgD25\n+2ucSErAQWOltiK2C1HUVWE0ncZQKMgvkrmquTY/04nqP6yc4Pmk3Z1XcjVoavIv\nnANlVdPbqysOkJRpAkU7fzX2IKySK6iLxz3LGWfQcfS8udfLG2gVNh0gtmWUBXX0\nT7zc3N4vscN+Ft8P3cQMAcEhkKqrXh3q1VXj05+JAoGAf4uxZHdFSqGSc7fRJJeq\nE50urzmUW/0SiJoAZa+MJu6/9ffUxtN4fpam4o29PPJpFYG5jAscUPL/n0vieOa9\nycMBwtDIUBYkcpF/jw395dbg+WTCjHkOspczhEwyryuZTmAtXLFyB3jlVvtLZ77G\nDjSCE7xclMlypU2xK0lnZEE=\n-----END PRIVATE KEY-----\n",
        "client_email": "sheet-515@tvbot-1352.iam.gserviceaccount.com",
        "client_id": "116828098159009637312"
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
