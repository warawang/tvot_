var  GoogleSpreadsheet = require('google-spreadsheet'),
  async = require('async'),
  doc = new GoogleSpreadsheet('');

// setting lib path
process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT']

exports.handler = function(event, context) {
  var UNIT_COUNT = 50;
  var doc = new GoogleSpreadsheet('');
  var sheet;

  async.waterfall([
    function setAuth(done) {
      var creds = {
        
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
