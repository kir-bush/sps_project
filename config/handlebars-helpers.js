module.exports = {
  ifDouble: function(a, b, opts) {      //хелпер двухэтажный if
    if (a) {
    	if(b){
        return opts.fn(this);
    	} else {
        return opts.inverse(this);
    	}
    }
  },
  list: function(context, options) {
    var ret = "";

    context.forEach(elem => {
      ret = ret + options.fn(elem);
    });

    return ret ;
  },
  listt: function(docs, cats, options) {
    var ret = "";
    var co = "";

    cats.forEach(elem => {
      co = co + `<option value=\"`+elem.cid+`\">`+elem.cname+`</option>`;
    });

    function getCatBy(num){
      var x="";
      cats.forEach(elem => {
        if(elem.cid == num){
          x=elem.cname;
        }
    });
      return x;
    }

    docs.forEach(elem => {
      let view =""
      let fn=""
      if (elem.filename != null) {
        fn = elem.filename
      } 

      ret = ret + "<tr id=\"rowid\">" +
                        "<td>" + "<a href=\""+ elem.id+"\">" + elem.id + "</a>" +"</td>"+
                        "<td>"+
                            "<div id=\"dt1" + elem.id + "\" class=\"disabled-text\">" + elem.name + "</div>"+
                            "<input id=\"" + elem.id+ "input\" class=\"text-field\" value=\"" + elem.name + "\" type=\"text\"  />"+
                        "</td>"+
                        "<td>"+

                            "<div id=\"dt2" + elem.id + "\"class=\"disabled-text\">" + getCatBy(elem.category) + "</div>"+
                            "<select id=\"" + elem.id + "select\" value=\"" + getCatBy(elem.category) + "\" class=\"select-field\" >"+
                                co+
                            "</select>"+
                        "</td>"+
                        "<td class=\"loaded\">" + elem.loaded + "</td>"+
                        "<td class=\"dt4\">" + elem.filename + "</td>"+
                        "<td>"+
                            "<div class=\"dropdown\">"+
                                "<button class=\"dropdown-btn\">Действия</button>"+
                                "<div id=\"myDropdown\" class=\"dropdown-content\">"+

                                  "<form id=\"loadform"+elem.id+"\"action=\"/info/file/"+elem.id+"\" method=\"post\" enctype=\"multipart/form-data\">"+
                                    "<label> Загрузить файл"+
                                      "<input type=\"file\" class=\"file-btn\" docId=\""+elem.id+"\" name=\"spsdocument\" accept=\".jpeg,.jpg,.png,.doc,.docx,application/pdf\"/>"+
                                    "</label>"+
                                  "</form>"+
                                  // view+
                                  "<a href=\"/info/file/"+elem.id+"\">Скачать файл</a>"+
                                  "<a rowid=\"" + elem.id + "\" class=\"edit-row-btn\" href=\"javascript: undefined;\">Редактировать данные</a>"+
                                "</div>"+
                            "</div>"+
                       "</td>"+   
                    "</tr>"
      ;
    });

    ret = ret + "<tr id=\"hidden-row\">"+
                        "<td style=\"background: #ccc;\">---</td>"+
                        "<td><input id=\"add-name\" class=\"text-field\" type=\"text\" style=\"display: inline-block;\" /></td>"+
                        "<td>"+
                            "<select id=\"add-cat\" class=\"select-field\" style=\"display: inline-block;\">"+
                                co+
                            "</select>"+
                        "</td>"+
                        "<td style=\"background: #ccc;\">---------</td>"+
                        "<td style=\"background: #ccc;\">-----</td>   "+
                    "</tr>";
    return ret ;
  }
}

