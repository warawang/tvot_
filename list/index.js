var async = require('async'),
  GoogleSpreadsheet = require('google-spreadsheet'),
  doc = new GoogleSpreadsheet('/* YOUR SHEET_ID */');

// setting lib path
process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT']

exports.handler = function(event, context) {
  var UNIT_COUNT = 10;
  var doc = new GoogleSpreadsheet('1HFX32QuaehqqoM9siwPa-Wcv6DiETlusxxfGj_8QIJY');
  var sheet;

  async.waterfall([
    function setAuth(done) {
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
    if(err) {
      context.succeed({
        "error" : 100,
        "text": "처리 중 오류가 발생했습니다. "+err,
      });
      return;
    }

    var youtubeList = [];

    for(i=0;i<UNIT_COUNT;i++) {
      if(rows[i].type == 'youtube') {
        youtubeList.unshift({
          info: rows[i].info,
          caster: rows[i].caster
        });
      }
    }

    context.succeed({
      'youtube' : youtubeList
    });
  });
};
