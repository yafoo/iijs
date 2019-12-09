function format(fmt, date) {
    (typeof date === 'string' || typeof date === 'number') && (date = new Date(parseInt(date + '000')));
	  date = date || new Date();
    let ret;
    let opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "y+": date.getFullYear().toString().slice(2),// 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "h+": date.getHours().toString(),           // 时
        "i+": date.getMinutes().toString(),         // 分
        "s+": date.getSeconds().toString()          // 秒
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
}

module.exports = {format};