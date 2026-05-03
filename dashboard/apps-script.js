/* ============================================================
   GOOGLE APPS SCRIPT — LUMINA INVITES RSVP HANDLER
   
   CARA SETUP:
   1. Buka Google Sheets → Extensions → Apps Script
   2. Hapus kode yang ada, paste seluruh kode ini
   3. Simpan (Ctrl+S)
   4. Klik Deploy → New Deployment
   5. Type: Web app
   6. Execute as: Me
   7. Who has access: Anyone
   8. Klik Deploy → Authorize → Copy the URL
   9. Paste URL tersebut di Admin Panel → Live Editor → "URL Google Apps Script"
   ============================================================ */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Setup header jika sheet masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp', 'ID Undangan', 'Nama Pasangan',
        'Nama Tamu', 'Kehadiran', 'Ucapan / Doa', 'Nama Tamu di Link'
      ]);
      // Format header
      var headerRange = sheet.getRange(1, 1, 1, 7);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#1a73e8');
      headerRange.setFontColor('#ffffff');
    }
    
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      new Date(),
      data.invId    || '-',
      data.couple   || '-',
      data.name     || '-',
      data.attendance || '-',
      data.message  || '-',
      data.guest    || '-'
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', message: 'RSVP berhasil disimpan' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getDataRange().getValues();
    
    if (rows.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Filter by invId if provided
    var filterInvId = e.parameter.invId || null;
    
    var result = [];
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      if (filterInvId && row[1] !== filterInvId) continue;
      result.push({
        timestamp:  row[0] ? new Date(row[0]).toLocaleString('id-ID') : '-',
        invId:      row[1] || '-',
        couple:     row[2] || '-',
        name:       row[3] || '-',
        attendance: row[4] || '-',
        message:    row[5] || '-',
        guest:      row[6] || '-'
      });
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
