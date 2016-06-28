var  GoogleSpreadsheet = require('google-spreadsheet'),
  async = require('async'),
  doc = new GoogleSpreadsheet('1HFX32QuaehqqoM9siwPa-Wcv6DiETlusxxfGj_8QIJY');

// setting lib path
process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT']

exports.handler = function(event, context) {
  var UNIT_COUNT = 50;
  var doc = new GoogleSpreadsheet('1HFX32QuaehqqoM9siwPa-Wcv6DiETlusxxfGj_8QIJY');
  var sheet;

  async.waterfall([
    function setAuth(done) {
      var creds = {
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCB4UHpkZfpBqAM\n3vx5gI0MVpbQXfxSt2EwcdoCVgscnLA6dZRMDy3elGadnw2bVrNrEEIBZ90xuOGe\niNZjrBudW/+UVGESUM1KRgcbWTmA7FWeWQHkpt1THcdIgP+Ocxw+1gNfMAnzVGfR\nMhOd1bfYAJs0CRd8e0KyINVQCKQiA+LE85xPkL9EWS7WM37KD8Jr3t3VUYpDw6Vv\nAXAYZQ1Gt9A39XcqyS0QAW2RdOEDn+RKoB1QifYJEcx5P0ZVrHYasIRMO96bkQ08\na13TBv26UEvXNGbRIUv1x+d5XamBeI3QgOBa8hrdqRA+LMG/yt/GWnPaLSD7yDsj\nA8IcNlszAgMBAAECggEAbVMsBSxNf5PZExx7ztZ7Y8BbMEd8hi/f+kRLax38OnhW\nCs9AJgm85ZdrDRB+BpyjZ+KGfOJtmVXzbFvognuzvvBaoQOpth4Xv4ZUoxumwLOu\nmhx38HzY3ga54XjcJI8WXnoM2on4Rj9tJ/UL+BaWqpZQDiv8/gZPLNtgUv8DEbGQ\ntri0wmH1Nl/oudZIXRNkHcC72+sVzpRcHB0aiA8oMrCbHXw4egUUX/mT3CIGQAja\n3lvjtiZhJwq7yhZ0ZQBdYHXDHUJz8tbQLz4kw4u1hB6UJJX+rK4UitrkTFXu3GQv\nWcYSwdJDXsXwcX3JBbFxQclmYkWpHL/ZLQ5f0AxLSQKBgQDrGVBIIzgvWrrjDxI0\nM3AzG4XvdecVsKtpadIy9RWOYexaOWAhNYl30JgJuhHCwq+a+hHpQlOCL/VCG5zt\nDms1bZdxzNfHnewDJWuKopyNm2UikHl2QxcglR9TX29gbr0fKLKWK/yCGHRw+M3F\nuKfScuIHCZL8uSn4irKjfmbUDQKBgQCNbTvMhKKXXSaXNS2BKkLfK0YuIJFxSTOE\no6DbWsbWX/U0SGZydHgOqIkzxm5OENQrVwL/i/Mxz2BAqzlpqFoOFbvsSWBJxZPp\nJ7MLui81m6KJ9VGyyiaevTfnSb34k04YgKRB1w+r6akuACoTCKu6WcPCmSo+wZvq\nvmjBQSHcPwKBgQCy8oWlIwm1Ib527hXRHgYdIKoF5xyJ6fvPNPkGSH6r7eVVl66Q\nGIwWYvQXE0ZJlJ7Nu+K+RfoCcjagpxv/ZKY9+Lj5qg3kp1Pp4SXGVJgNQWbttEJ/\nvflwl5FMiKviHuhdO0EUBU8iRzL6eqdGBJPZIBDjgmoba2WDBS+MOr5SUQKBgD25\n+2ucSErAQWOltiK2C1HUVWE0ncZQKMgvkrmquTY/04nqP6yc4Pmk3Z1XcjVoavIv\nnANlVdPbqysOkJRpAkU7fzX2IKySK6iLxz3LGWfQcfS8udfLG2gVNh0gtmWUBXX0\nT7zc3N4vscN+Ft8P3cQMAcEhkKqrXh3q1VXj05+JAoGAf4uxZHdFSqGSc7fRJJeq\nE50urzmUW/0SiJoAZa+MJu6/9ffUxtN4fpam4o29PPJpFYG5jAscUPL/n0vieOa9\nycMBwtDIUBYkcpF/jw395dbg+WTCjHkOspczhEwyryuZTmAtXLFyB3jlVvtLZ77G\nDjSCE7xclMlypU2xK0lnZEE=\n-----END PRIVATE KEY-----\n",
        "client_email": "sheet-515@tvbot-1352.iam.gserviceaccount.com",
        "client_id": "116828098159009637312"
      };
      doc.useServiceAccountAuth(creds, done);

      //속도 이슈로 TOKEN을 사용하는 방식으로
      /*
      doc.setAuthToken({
        access_token: 'ya29.CjAOA0svatD3sdioibEYb-PP297KEb2wVSHxMrVMH8w3VvqZkiTiFdRSQa6YHnsYx0g',
        token_type: 'Bearer',
        expiry_date: 1467017640000,
        refresh_token: 'jwt-placeholder'
      });
      done();
      */
    },
    function getInfoAndWorksheets(done) {
      doc.getInfo(function(err, info) {
        if(err) return done(err);

        console.log('Loaded doc: '+info.title+' by '+info.author.email);
        sheet = info.worksheets[0];
        console.log('sheet 1: '+sheet.title+' '+sheet.rowCount+'x'+sheet.colCount);

        if(sheet.rowCount-1<UNIT_COUNT) UNIT_COUNT = sheet.rowCount-1;
        done(null);
      });
    },
    function getRows(done) {
      sheet.getRows({
        offset: sheet.rowCount-UNIT_COUNT,
        limit: UNIT_COUNT,
        orderby: 'createAt'
      }, function(err, rows){
        if(err) return done(err);
        done(null, rows);
      });
    }
  ],function(err, rows) {
    var list = [];
    var nowTs = new Date().getTime();
    var limitTs = parseInt(event.limit);
    var cutTs = nowTs - (limitTs || 0);
    var youtubeList = [];
    if(err) {
      context.succeed({
        "error" : 100,
        "text": "처리 중 오류가 발생했습니다. "+err,
      });
      return;
    }

    for(i=0;i<UNIT_COUNT;i++) {
      if(rows[i].type == 'youtube') {
        // 최근 event.limit 초 안에 등록된 영상만 리턴
        if(limitTs>0) {
          if(cutTs < Date.parse(rows[i].createat)) {
            youtubeList.unshift({
              info: rows[i].info,
              caster: rows[i].caster,
              createAt: rows[i].createAt
            });
          }
        } else { // 전체목록 리턴
          youtubeList.unshift({
            info: rows[i].info,
            caster: rows[i].caster,
            createAt: rows[i].createAt
          });
        }

      }
    }

    context.succeed({
      'youtube' : youtubeList
    });
  });
};
