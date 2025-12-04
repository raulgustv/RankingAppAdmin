import * as XLSX from 'xlsx'

export const exportToExcel = (matches) => {
    const data = matches.map((m, index) =>({
            Match: index + 1,
            Player1: `${m.player1.name} ${m.player1.lastName}`,
            Player1Rank: m.player1.ranking,
            Player1Contact: m.player1.contactNumber,
            Player2: `${m.player2.name} ${m.player2.lastName}`,
            Player2Rank: m.player2.ranking,
            Player2Contact: m.player2.contactNumber
        }));

       //create excel
       const ws = XLSX.utils.json_to_sheet(data)

       //create sheet
       const wb = XLSX.utils.book_new();
       XLSX.utils.book_append_sheet(wb, ws, "Matches")

       //Export
       XLSX.writeFile(wb, "match_summmary.xls")
}