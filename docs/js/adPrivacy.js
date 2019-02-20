;var AD_PRIVACY = AD_PRIVACY || (function(){

  var API = {
    notices:[],
    configs: {},
    scripts_needed: 0
  };
  
  var browser,
    DOMAIN_ROOT = '//c.betrad.com',
    DOMAIN_JSON = DOMAIN_ROOT + '/a/',
    DOMAIN_INFO = 'http://info.evidon.com/',
    window_ready_status = 'unloaded',
    domain = 'undefined',
    _gdn,
    version = '78f7264',
    treatment = '2',
    country = 'us',
    cicon = '_us',
    micon = 'ci',
    bap_dom = document.createElement('DIV'),
    z_depth = 0,
    is_mobile,
    in_app,
    mraid_in_use,
    overlay_css =".bap-blue,.bap-close,.bap-div,.bap-gradient,.bap-gray,.bap-img-container,.bap-notice,.bap-link-div{color:#000;white-space:normal;word-wrap:normal;vertical-align:middle !important;margin:0;padding:0;border:0;outline:0;font-family:Arial !important;font-size:100%;border-collapse:collapse;border-spacing:0;line-height:13px;list-style:none;letter-spacing:0 !important;text-align:left;overflow:visible !important}.bap-notice{background-color:#fff;padding:2px;font-size:16px;line-height:13px;z-index:9991;top:-100px;left:-100px}.bap-blue,.bap-blue:link,.bap-blue:visited{color:#2b2f98}.bap-close{width:20px;color:#707070;font-size:10px;font-weight:bold;margin-left:-22px;position:relative;top:1px;left:100%;cursor:pointer}.bap-div{border:1px solid #ababab}.bap-div p{float:none;padding:0}.bap-gray,.bap-gray:visited{color:#444}.bap-img-container a{vertical-align:middle;display:table-cell;height:45px}.bap-link-div{height:14px;color:#2b2f98;border-top:1px solid #ababab;padding:3px 10px 4px 10px;text-decoration:none;font-size:.67em !important;font-weight:bold}.bap-link-div a,.bap-link-div span{text-decoration:none;font-size:inherit;font-weight:bold}#BAP-holder img{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline;max-width:100%;box-shadow:0 0 !important;-moz-box-shadow:0 0 !important;-webkit-box-shadow:0 0 !important;background:none !important}#BAP-holder{position:static !important}#BAP-holder .bap-trigger{z-index:9990}.bap-trigger{cursor:pointer;display:block;font-family:Arial;font-size:8pt;white-space:nowrap}.bap-trigger img{width:auto;height:auto}.bap1 .bap-img-container{margin:-18px 0 9px 10px;height:45px;position:static}.bap1 .bap-img-container img{margin-top:6px !important}.bap1 p{font-size:.7em;margin:4px 5px 0 10px;padding-bottom:6px;line-height:13px;width:259px}.bap1 .bap-close{<!--[if lte IE 7]>top:0;left:273px !important;<![endif]-->}.bap2 .bap-close{z-index:1}.bap2 .bap-close{<!--[if lte IE 7]>top:0;left:152px !important;<![endif]-->}.bap2 .bap-gray,.bap-gray:visited{padding-right:0 !important;word-spacing:-2px;font-size:.8em}.bap2 .bap-img-container{position:relative;top:-7px;margin-left:10px}.bap2 .bap-link-div{height:100%}.bap2 .bap-notice{font-size:12px}.bap2 .bap-img-container img{display:block;margin-top:10px}.bap2 p{font-size:11px;margin:2px 5px 0 10px;padding-bottom:7px;line-height:13px}.bap5 .bap-gray,.bap-gray:visited{font-size:95%}.bap5 .bap-link-div{background-color:#dcdcdc;font-size:.8em;padding:3px 3px 4px 6px}.bap5{font-size:12px;width:190px}.bap5 .bap-spacer-div{height:1px}.bap5 p{font-size:.8em;margin:3px 6px 0 5px;padding-bottom:3px;line-height:13px}.bap5 .bap-close{<!--[if lte IE 7]>top:0;left:185px !important;<![endif]-->}.bap6 .bap-close{margin-left:0;display:inline;float:right;right:10px;left:0 !important}.bap6 .bap-div{height:84px;min-width:688px}.bap6 .bap-gradient{float:left;height:84px}.bap6 .bap-img-container{float:right;clear:right;margin-top:10px;height:45px;width:115px}.bap6 .bap-link-div{padding:4px 10px 3px 10px;overflow:hidden}.bap6 .bap-link-div a,.bap6 .bap-link-div span{display:block;width:auto !important;max-width:275px;min-width:210px;line-height:130%}.bap6 p{font-size:.7em;width:310px;margin:5px 0 0 10px;line-height:13px}#bap-gradient-1{border-right:1px solid #ababab;width:auto !important;max-width:280px;min-width:230px}#bap-gradient-2{width:441px}#bap-first-link-div{border:0}",
    one_time_procedures_done = false,
    iframe_depth = 0,
    iframed_notices = [],
    beacon_codes = {
      I: '0/1/0/0/0/0', // -- icon (L1) shown
      S: '0/0/1/0/0/0', // -- notice (L2) shown
      A: '0/0/0/1/0/0', // -- advertiser clicked
      B: '0/0/0/0/1/0', // -- IAB clicked
      M: '0/0/0/0/0/1', // -- more info
      O: '0/1/0/0/0/0'  // -- dynamic inclusion overwrite
    };

  // Base object that manages each notice.
  /*
  options: {
    nid: 123,                 // Evidon notice id
    uqid: 123,                // Generated on page unique page id
    icaid: 123,               // Evidon campaign id
    ecaid: 123,               // Your own campaign id
    coid: 123,                // Evidon company id
    aid: 123,                 // Evidon advertiser id
    ad_h: 123,                // ad height in pixels
    ad_w: 123,                // ad width in pixels
    ad_wxh: 300x250           // ad width X height
    ad_oas: 'WIDTH=160 HEIGHT=600'
    position: 'top-left'      // position
    container: 'element id'   // will be used as the anchor elemetn for the notice
    delay_start: 1            // delay processing start by this many seconds
    adi: dmd.ehow,dmd.poop    // dfa whitelist (???)
  }
  */
  var Notice = function(params){
    var key,val;
    for (param in params){
      key = params[param].split('=')[0];
      val = params[param].split('=')[1];
      this[key] = val;
    }
    if (this.ad_wxh){
      this.ad_w = this.ad_wxh.split('x')[0];
      this.ad_h = this.ad_wxh.split('x')[1];
    }
    if (this.ad_oas){
      this.ad_w = this.ad_oas.split(' ')[0].split('='[1]);
      this.ad_h = this.ad_oas.split(' ')[1].split('='[1]);
    }
    this.icon_position = this.position;
    this.unique_id = Math.floor(Math.random()*100000);
    this.potential_ads = [];
    this.attached_notices = [];
    this.is_attached = false;
    this.configured = false;

    this.beacon_calls = {
      I: false,
      S: false,
      A: false,
      B: false,
      M: false,
      O: false
    };
    this.overwrite = ''; //<== gets changed to '&o=1' if overwritten.
    this.__notice = this;
  };

  // This is the starting point of the script.  After initial set up, it calls support scripts and configs
  function initial_procedures(){
    var script = find_this_script();
    if (script == false){return;}
    var params = String(script.src).split(';');
    var notice = new Notice(params);
    notice.call_script = script;
    call_config(notice);
    AD_PRIVACY.notices.push(notice);
    if (!one_time_procedures_done){
      do_one_time_procedures();
    }
    set_window_ready(AD_PRIVACY);
  }

  function do_one_time_procedures(){
    one_time_procedures_done = true;
    bap_dom.id = 'bap_privacy';
    document.body.appendChild(bap_dom);
    user_agent_considerations(AD_PRIVACY);
    attach_css();
    var _window = window,
      _parent = window.parent;
    while(_window != _parent){
      iframe_depth++;
      _window = _parent;
      _parent = _parent.parent;
    }
    domain = _parent.document.location.host;
    addEvent(window, 'message', messageEvent);
    _gdn = !!(document.getElementById('abgc') && window.abgp);
    debug_overwrites();
  }

  function debug_overwrites(){
    if(!window.bap_debug){return;}
    is_mobile = bap_debug.is_mobile || is_mobile;
    in_app = bap_debug.in_app || in_app;
  }

  function attach_css(){
    var ss;
    if (!browser.IE) {
      ss = document.createElement('style');
      ss.setAttribute('type', 'text/css');
      ss.innerHTML = overlay_css;
      document.body.appendChild(ss);
    } else {
      ss = document.createStyleSheet("");
      ss.cssText = overlay_css;
    }
  }

  function find_this_script(){
    var scripts = document.getElementsByTagName('SCRIPT');
    for (var i = 0; i < scripts.length; i++){
      var script = scripts[i];
      if (!script.src){continue;}
      if (script._used) { continue; }
      var url = script.src;
      if (url.indexOf(DOMAIN_ROOT) < 9 && url.match('adPrivacy.js')){
        script._used = true;
        return script;
      }
    }
    return false;
  }

  // Adds user agent information to the AD_PRIVACY object.
  function user_agent_considerations(AD_PRIVACY){
    AD_PRIVACY.ua = navigator.userAgent;
    browser = function() {
      var ua = navigator.userAgent,
       isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]',
       safv = ua.substring( (ua.indexOf("Version"))  + "Version".length + 1),
       ie = (!!window.attachEvent && !isOpera && document.createStyleSheet);

      try { safv = safv.substring(0, safv.indexOf(' ')); } catch (e) {}

      return {
        IE:             ie,
        IE6:            ua.indexOf('MSIE 6') > -1,
        IE7:            ua.indexOf('MSIE 7') > -1,
        IE8:            ua.indexOf('MSIE 8') > -1,
        Opera:          isOpera,
        Gecko:          ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1,
        Safari:         ( (ua.indexOf('Safari') > -1) && (ua.indexOf('Chrome') <= -1) ),
        Chrome:         !!ua.match('Chrome'),
        QuirksMode:     ie && document.compatMode == 'BackCompat',
        SafariVersion:  safv
      };
    }();
    is_mobile = (/ip(hone|od)|(android).+mobile|opera m(ob|in)i/i).test(navigator.userAgent);

    var viewport_is_ad_size = AD_PRIVACY.notices[0].ad_w + 10 > document.documentElement.clientWidth && 
                                    document.documentElement.clientWidth > AD_PRIVACY.notices[0].ad_w - 10 &&
                                    AD_PRIVACY.notices[0].ad_h + 5 > document.documentElement.clientHeight && 
                                    document.documentElement.clientHeight > AD_PRIVACY.notices[0].ad_h - 5;
    in_app = (navigator.userAgent.match(/iPhone|iPad|iPod/) != null && navigator.userAgent.indexOf('Safari') == -1) || (navigator.userAgent.indexOf('Android') != -1 && viewport_is_ad_size) ? true : false;

    call_support_scripts(AD_PRIVACY);
  }

  // Calls user agent special handling scripts. (separated out for ease of access/code management)
  function call_support_scripts(AD_PRIVACY){
    // (this one is just a test)
    // if (browser.Chrome){
    //   var support_url = '/chrome_support'
    //   var support_script = document.createElement("script");
    //   AD_PRIVACY.scripts_needed++;
    //   support_script.src = DOMAIN_ROOT + support_url + '.js';
    //   document.body.appendChild(support_script);
    // }
    //browser and user agent considerations
  }

  // Calls client config.
  function call_config(notice){
    //must have config
    if (typeof AD_PRIVACY.configs['config_'+notice.nid] == 'undefined'){
      //call the script
      var config_url = 'n/' + notice.coid + '/' + notice.nid;
      var config_script = document.createElement("script");
      AD_PRIVACY.configs['config_'+notice.nid] = {load_status: 'loading'};
      config_script.src = DOMAIN_JSON + config_url + '.js';
      document.body.appendChild(config_script);
    }else if (AD_PRIVACY.configs['config_'+notice.nid].load_status == 'ready'){
      //set config if it is ready
      configure_notice(notice);
    }
  }

  function configure_notice(notice){
    if (notice.configured){return;}
    var config = AD_PRIVACY.configs['config_'+notice.nid].config;
    for (key in config){
      notice[key] = notice[key] || config[key];
    }
    notice.icon_dir = (notice.generic_icon ? '/icong' : '/icon');
    notice.icon_grayscale = notice.icon_grayscale || 100;
    notice.container_opacity = notice.container_opacity || 100;
    notice.delay_start = parseFloat(notice.delay_start) || parseFloat(config.icon_delay) || 0;
    // TODO: set defaults

    notice.revision = notice.revision || 0;

    if (_gdn) {
      notice.position = 'top-right';
      notice.icon_display = 'expandable';
      notice.server = ({'name':'Google'});
      document.getElementById('abgc').style.display = 'none';
    }

    notice.defTrans = {};
    notice['default_generic1'] && (notice.defTrans.generic1 = notice['default_generic1']);
    notice['default_generic2'] && (notice.defTrans.generic2 = notice['default_generic2']);
    notice['default_generic3'] && (notice.defTrans.generic3 = notice['default_generic3']);
    notice['default_generic4'] && (notice.defTrans.generic4 = notice['default_generic4']);
    notice['default_generic5'] && (notice.defTrans.generic5 = notice['default_generic5']);
    notice['default_generic6'] && (notice.defTrans.generic6 = notice['default_generic6']);
    notice['default_link1'] && (notice.defTrans.link1 = notice['default_link1']);
    notice['default_link2'] && (notice.defTrans.link2 = notice['default_link2']);
    notice['default_link2'] && (notice.defTrans.link3 = notice['default_link3']);
    notice['default_footer'] && (notice.defTrans.footer = notice['default_footer']);

    // reusing skip flag if the L1 has no appropriate L2, but is not a mini.
    // AD_PRIVACY.options[pageId].skipL2 = (cud.skip_L2 || isSkipper(AD_PRIVACY.options[pageId].ad_w, AD_PRIVACY.options[pageId].ad_h));  <====  NOTE: may need to rethink this.

    // overwrite with localized version if available
    var mp = notice.message_properties || '';

    mp['behavioral_' + country] && (notice.behavioral = mp['behavioral_' + country]);
    // mp['behavioral_' + country] && (AD_PRIVACY.options[pageId].noDefault = true);  <=====   NOTE: I think I got this taken care of.

    // default icon
    notice['default_icon'] && (!notice['behavioral_' + country]) && (notice.cicon = notice['default_icon']);

    mp['generic_text_' + country] && (notice.behavioralCustomMessage = mp['generic_text_' + country]);
    mp['adv_name_' + country] && (notice.adv_name = mp['adv_name_' + country]);
    mp['adv_msg_' + country] && (notice.adv_msg = mp['adv_msg_' + country]);
    mp['adv_logo_' + country] && (notice.adv_logo = mp['adv_logo_' + country].replace("http:","").replace("https:","") );
    mp['adv_link_' + country] && (notice.adv_link = mp['adv_link_' + country]);
    mp['translation_' + country] && (notice.translation = mp['translation_' + country]);
    mp['translation_' + country] && (notice.cicon = mp['translation_' + country].icon);
    mp.hasOwnProperty('skip_L2_' + country) && (notice.skip_L2 = mp['skip_L2_' + country]);

    notice.ciconWidth = notice.ciconWidth || 77;

    // if short length notice, overwrite length.
    if ( notice.cicon == '_nl' || (!notice.cicon && country == 'nl') ) {
      notice.ciconWidth = 47;
    }

    // if extended length notice, overwrite length and set to be expandable.
    if ( /_(de|es|nl_be|si|mt|lt|gr|ee|is|bg|tr|il|ar|hr|rs)$/.test(notice.cicon) || (!notice.cicon && /de|es|be|si|mt|lt|gr|cy|ee|is|bg|tr|il|sa|eg|hr|rs/.test(country)) ) {
      notice.icon_display = 'expandable';
      notice.ciconWidth = 107;
    }

    // setting a final default here if the custom text has not already been set.
    // this addresses bug #5341 in axosoft
    if (!notice.behavioralCustomMessage && notice.behavioral === 'custom') {
      notice.behavioralCustomMessage = notice.generic_text;
    }

    // see if the notice is below a specific size. 
    notice.mini = isMini(notice.ad_w, notice.ad_h);

    notice.ciconWidth_big = notice.ciconWidth;
    notice.ciconWidth_small = 19;
    notice.configured = true;
    notice.kick_off();
  }

  function copyJSON(config){
    // set config data
    var nid = config.data.nid;
    if (!AD_PRIVACY.configs['config_'+nid]){return;}
    AD_PRIVACY.configs['config_'+nid].config = config.data;
    // update pending notices
    for (var i = 0; i < AD_PRIVACY.notices.length; i++){
      if (AD_PRIVACY.notices[i].nid == nid){
        configure_notice(AD_PRIVACY.notices[i]);
      }
    }
    AD_PRIVACY.configs['config_'+nid].load_status = 'ready';
  };

  function set_window_ready(AD_PRIVACY){
    if (document.readyState != 'complete'){
      if (window_ready_status != 'loading'){
        window_ready_status = 'loading';
        addEvent(window, 'load', function(){
          window_ready_status = 'complete';
          set_z_depth();
          kick_off_notices();
          start_monitoring_page();
        });
      }
    }else{
      window_ready_status = 'complete';
      set_z_depth();
      kick_off_notices();
      start_monitoring_page();
    }
  }

  function set_z_depth(){
    var body_children = document.body.childNodes,
      high_z = 0;
    for (var i = 0; i < body_children.length; i++){
      try{
        if (parseInt(body_children[i].style.zIndex) > high_z){
          high_z = parseInt(body_children[i].style.zIndex);
        }
      }catch (e){}
    }
    z_depth = high_z;
  }

  function kick_off_notices(){
    for (var i = 0; i < AD_PRIVACY.notices.length; i++){
      AD_PRIVACY.notices[i].kick_off();
    }
  }

  function start_monitoring_page(){
    var monitor_duration = 3 * 1000;
    var monitor_interval = setInterval(function(){
      for (var i = 0; i < AD_PRIVACY.notices.length; i++){
        find_ad_dom_element(AD_PRIVACY.notices[i]);
        if (!AD_PRIVACY.notices[i].icon && AD_PRIVACY.notices[i].ad){
          // console.log('place icon');
          place_icon(AD_PRIVACY.notices[i]);
        }
      }
      resize();
      check_for_mraid();
      monitor_duration -= 200;
      if (monitor_duration <= 0){
        clearInterval(monitor_interval);
      }
    }, 200);
    addEvent(window, 'resize', resize);
  }

  function check_for_mraid(){
    if (!in_app || mraid_in_use){return;}
    if (typeof mraid !== 'undefined'){
      mraid_in_use = true;
      if (mraid.getState() === 'loading'){
        mraid.addEventListener('ready', mraidSetup);
      }else{
        mraidSetup();
      }
    }

    function mraidSetup(){
      mraid.addEventListener('stateChange', function(){
        if (mraid.getState() === 'default'){
          bap_dom.style.display = 'block';
        }else{
          bap_dom.style.display = 'none';
        }
      });
    }
  }

  Notice.prototype.kick_off = function(){
    if (window_ready_status != 'complete'){return;}
    if (AD_PRIVACY.scripts_needed){return;}
    if (!this.configured){return;}
    if (this.preccessed){return;}
    this.proccessed = true;
    find_ad_dom_element(this);
    place_icon(this);
    determine_notice_position(this);
    register_for_collision(this);
    var colliding_notice = check_for_collision(this);
    if (colliding_notice){
      hide_notice_icon(this);
      var message_params = package_notice_params(this);
      colliding_notice.postMessage(message_params, '*');
    }
    check_for_collision(this); // <-- todo: get this to work from this end.
    // console.log(this.icon_position);
  };

  // making collision backwards compatible.
  function do_old_collision(event){
    var message = event.data.split('|');
    if (message[0] == 'BAPFRAMEID'){
      if (iframed_notices.indexOf(event.source) == -1){iframed_notices.push(event.source);}
      // check to see if notices in this window are colliding.
      for (var i = 0; i < AD_PRIVACY.notices.length; i++){
        if (AD_PRIVACY.notices[i].proccessed && check_for_collision(AD_PRIVACY.notices[i])){
          hide_notice_icon(AD_PRIVACY.notices[i]);
          beacon_call(AD_PRIVACY.notices[i], 'O');
          var message_params = package_old_notice_params(AD_PRIVACY.notices[i], message[1]);
          event.source.postMessage(message_params, '*');
        }
      }
    }else if(message[0] == 'BAPTANGO?'){
      event.source.postMessage('BAPLETSDANCE|' + message[1], '*');
      event.source.postMessage('BAPFRAME|' + AD_PRIVACY.notices[0].nid + '|' + message[1], '*');
    }else if(message[0] == 'BAPACCEPT'){
      var data = parse_old_accept_message(message);
      data.beacon_calls = {
        I: true,
        S: false,
        A: false,
        B: false,
        M: false,
        O: true
      };
      data.overwrite = '&o=1';
      for (var i = 0; i < AD_PRIVACY.notices.length; i++){
        attach_notice(AD_PRIVACY.notices[i], data);
      }
    }
  }

  function package_old_notice_params(notice, nid){
    return 'BAPACCEPT|' + nid + '|' + notice.nid + '|' + (notice.aid || 0) + '|' + (notice.icaid || 0) + '|' + (notice.ecaid || 0) + '|' + notice.coid + '|' + notice.ad_w + '|' + notice.ad_h + '|'  + notice.revision + '|' + (notice.cps || '-') + '|' + (notice.seg || '-');
  }

  function parse_old_accept_message(message){
    return {nid: message[2], aid: message[3], icaid: message[4], ecaid: message[5], coid: message[6], ad_w: message[7], ad_h: message[8], revision: message[9], cps: (message[10] == '-')? undefined : message[10], seg: (message[11] == '-')? undefined : message[11] }
  }

  function messageEvent(event){
    if (typeof event.data == "string" && event.data.substring(0,3) == 'BAP'){do_old_collision(event);return;}
    if (event.data.__message_type == 'first_contact'){
      if (iframed_notices.indexOf(event.source) == -1){iframed_notices.push(event.source);}
      for (var i = 0; i < AD_PRIVACY.notices.length; i++){
        if (AD_PRIVACY.notices[i].proccessed && check_for_collision(AD_PRIVACY.notices[i])){
          // console.log('we have a notice that is already proccessed');
          // break down visible notice.
          hide_notice_icon(AD_PRIVACY.notices[i]);
          var message_params = package_notice_params(AD_PRIVACY.notices[i]);
          event.source.postMessage(message_params, '*');

        }
      }
    }else if(event.data.__message_type == 'already made'){
      // console.log('that ad is already made!');
    }else if(event.data.__message_type == 'attach notice'){
      for (var i = 0; i < AD_PRIVACY.notices.length; i++){ // There should really only be one.
        attach_notice(AD_PRIVACY.notices[i], event.data);
        if (AD_PRIVACY.notices[i].is_attached){
          // send this attached notice down.
        }
      }
    }else if (event.data.__message_type == 'detach notice'){
      for (var i = 0; i < AD_PRIVACY.notices.length; i++){
        detach_notice(AD_PRIVACY.notices[i], event.data);
      }
    }
  }

  function attach_notice(notice, data){
    for (var i = 0; i < notice.attached_notices.length; i++){
      if (notice.attached_notices[i].nid == data.nid && notice.attached_notices[i].iframe_depth == data.iframe_depth){
        return;
      }
    }
    if (notice.nid == data.nid){return;} //Don't attach the same nid's
    notice.attached_notices.push(data);
    beacon_call(data, 'O');
  }

  function detach_notice(notice, data){
    for (var i = 0; i < notice.attached_notices.length; i++){
      if (notice.attached_notices[i].nid == data.nid && notice.attached_notices[i].iframe_depth == data.iframe_depth){
        notice.attached_notices.splice(i,1);
        return;
      }
    }
  }

  function hide_notice_icon(notice){
    notice.is_attached = true;
    if (notice.icon){
      notice.icon.style.display = 'none';
    }
    notice.overwrite = '&o=1';
  }


  function check_for_collision(notice){

    function get_comparible_window(parent, decendant){
      if (parent != decendant.parent){
        return get_comparible_window(parent, decendant.parent);
      }
      return decendant;
    }

    if (!notice.ad){return false;}
    var everything = document.getElementsByTagName('*');
      for (var i = 0; i < everything.length; i++){
      if (everything[i].nodeName == 'IFRAME' && (notice.ad.node.contains(everything[i]) || notice.ad.node == everything[i]) ){
        for (var j = 0; j < iframed_notices.length; j++){
          if (everything[i].contentWindow == get_comparible_window(window, iframed_notices[j])){
            // console.log('I want you to want me!');
            return iframed_notices[j];
          }
        }
      }
    }
    return false;
  }

  function register_for_collision(notice){
    var parent = window.parent;
    var _window = window;
    var loop_term = 20;
    while(_window != parent){
      // console.log('make the call!');
      parent.postMessage({__message_type: 'first_contact'},'*');
      _window = parent;
      parent = parent.parent;
      loop_term--;
      if (loop_term < 0){break;}
    }
  }

  function package_notice_params(notice){
    beacon_call(notice, 'O');
    var params = {__message_type: 'attach notice'};
    var config;
    for (var i = 0; i < AD_PRIVACY.configs; i++){
      if (notice.nid == AD_PRIVACY.configs[i].nid){
        config = AD_PRIVACY.configs[i];
        break;
      }
    }
    for (key in config){
      params[key] = params[key];
    }
    var key,val,script_params;
    script_params = String(notice.call_script.src).split(';');
    for (param in script_params){
      key = script_params[param].split('=')[0];
      val = script_params[param].split('=')[1];
      params[key] = val;
    }
    params.iframe_depth = iframe_depth;
    params.beacon_calls = notice.beacon_calls;
    params.attached_notices = [];//notice.attached_notices;
    params.overwrite = notice.overwrite;
    params.ad_src = notice.ad_src;
    return params;
  }

  function find_ad_dom_element(notice){
    //MIGHT check for object types... not sure it is needed.  Will have to look into it more.
    var current_ad = notice.ad;
    if (notice.container){
      find_container(notice);
    }else{
      is_iframe(notice) || look_around_dom(notice);
    }
    if (notice.ad){
      set_ad_src(notice);
      beacon_call(notice, 'I');
    }
    if (current_ad != notice.ad && notice.is_attached){
      notice.is_attached = false;
      notice.overwrite = '';
      send_detach_message(notice);
      if (notice.icon){notice.icon.style.display = 'block';}
    }
  }


  function set_ad_src(notice){
    if(!notice.ad){return;}
    var everything = document.getElementsByTagName('*');
    var iframes = [];
    var imgs = [];
    var width_height,
      biggest_area = 0,
      src = 'na'
    for (var i = 0; i < everything.length; i++){
      if (notice.ad.node.contains(everything[i])){
        if (everything[i].nodeName == 'IFRAME'){
          iframes.push(everything[i]);
        }else if (everything[i].nodeName == 'IMG'){
          imgs.push(everything[i]);
        }
      }
    }
    var elements_used = (iframes.length)? iframes : imgs; // iframes take priority
    for (i = 0; i < elements_used.length; i++){
      width_height = getDims(elements_used[i]);
      if (biggest_area < width_height[0]*width_height[1]){
        biggest_area = width_height[0]*width_height[1];
        src = elements_used[i].src;
      }
    }
    notice.ad_src = encodeURIComponent(src);
  }


  function send_detach_message(notice){
    var message = {
      __message_type: 'detach notice',
      nid: notice.nid,
      iframe_depth: iframe_depth
    };
    for (var i = 0; i < iframed_notices.length; i++){
      iframed_notices[i].postMessage(message, '*');
    }
    window.postMessage(message, '*');
  }

  function determine_notice_position(notice){
    if (!notice.ad){return;}
    var pos_x, pos_y, ad_x, ad_y;
    // find top level position of ad
    ad_x = notice.ad.node.offsetLeft;
    ad_y = notice.ad.node.offsetTop;
    // consider the corner
    if (notice.icon_position.indexOf('right') > -1){
      ad_x += (notice.ad_w - notice.ciconWidth);
    }
    if (notice.icon_position.indexOf('bottom') > -1){
      ad_y += (notice.ad_h - 15);
    }
    // account for offsets
    notice.pos_x = ad_x + notice.offset_x;
    notice.pos_y = ad_y + notice.offset_y;
    if (notice.icon){
      notice.icon.style.left = notice.pos_x + 'px';
      notice.icon.style.top = notice.pos_y + 'px';
    }
  }

  function determine_overlay_position(notice){
    if (!notice.overlay){return;}
    var pos_x, pos_y;
    // find top level position of ad
    pos_x = notice.ad.node.offsetLeft;
    pos_y = notice.ad.node.offsetTop;
    // consider the corner
    if (notice.icon_position.indexOf('right') > -1){
      pos_x += (notice.ad_w - notice.overlay.clientWidth);
    }
    if (notice.icon_position.indexOf('bottom') > -1){
      pos_y += (notice.ad_h - notice.overlay.clientHeight);
    }
    if (is_mobile){pos_x -= 2;}
    // account for offsets
    notice.overlay.style.left = pos_x + 'px';
    notice.overlay.style.top = pos_y + 'px';
  }

  function place_icon(notice){
    if (!notice.ad || notice.is_attached || notice.being_delayed){return;}
    if (notice.delay_start){
      notice.being_delayed = true;
      setTimeout(function(){
        notice.delay_start = false;
        notice.being_delayed = false;
        place_icon(notice);
      },parseInt(notice.delay_start)*1000);
      return;
    }
    var opacity;
    var icon = document.createElement('IMG'),
      bg_image = document.createElement('IMG');
      div = document.createElement('DIV');

    try { opacity = parseInt( ( notice.container_opacity ) ) / 100; } catch (e) { opacity = 1; }

    // set this to use OR logic for the check so we show just the icon on expandable, icon, and
    // mini ads.  This is the fix for bug #5037 (axosoft).  This stuff is largely undocumented so 
    // hopefully this is how the logic should work.
    if (notice.icon_display === 'expandable' || (notice.icon_display === 'icon') || notice.mini ) {
      notice.icon_src = DOMAIN_ROOT + notice.icon_dir + '/' + micon + '.png';
      notice.ciconWidth = notice.ciconWidth_small;
    }else{
      notice.icon_src = DOMAIN_ROOT + notice.icon_dir + '/c_' + notice.icon_grayscale + (notice.cicon ? notice.cicon : cicon) + '.png';
      notice.ciconWidth = notice.ciconWidth_big;
    }


    icon.src = notice.icon_src;
    icon.style.position = 'absolute';
    bg_image.src = DOMAIN_ROOT + notice.icon_dir + '/box_' + notice.ciconWidth + '_' + notice.icon_position + '.png';
    bg_image.style.opacity = opacity;
    bg_image.style.filter = 'alpha(opacity='+(opacity*100)+')';
    bg_image.style.position = 'absolute';
    div.appendChild(bg_image);
    div.appendChild(icon);

    div.style.position = 'absolute';
    div.style.left = notice.pos_x + 'px';
    div.style.top = notice.pos_y + 'px';
    div.style.width = notice.ciconWidth+'px';
    div.style.height = '15px';
    div.style.zIndex = z_depth;
    div.style.cursor = 'pointer';
    div.__notice = notice;
    bap_dom.appendChild(div);

    if (notice.icon_display == 'expandable'){
      addEvent(div, 'mouseenter', expand_icon);
      addEvent(div, 'mouseleave', contract_icon);
    }

    addEvent(div, 'click', icon_clicked);
    notice.icon = div;
  }

  function expand_icon(event){
    var notice = this.__notice;
    notice.ciconWidth = notice.ciconWidth_big;
    notice.icon.childNodes[1].src = DOMAIN_ROOT + notice.icon_dir + '/c_' + notice.icon_grayscale + (notice.cicon ? notice.cicon : cicon) + '.png';
    notice.icon.childNodes[0].src = DOMAIN_ROOT + notice.icon_dir + '/box_' + notice.ciconWidth + '_' + notice.icon_position + '.png';
    notice.icon.style.width = notice.ciconWidth + 'px';
    determine_notice_position(notice);
  }

  function contract_icon (event){
    var notice = event.target.__notice;
    notice.ciconWidth = notice.ciconWidth_small;
    notice.icon.childNodes[1].src = DOMAIN_ROOT + notice.icon_dir + '/' + micon + '.png';
    notice.icon.childNodes[0].src = DOMAIN_ROOT + notice.icon_dir + '/box_' + notice.ciconWidth + '_' + notice.icon_position + '.png';
    notice.icon.style.width = notice.ciconWidth + 'px';
    determine_notice_position(notice);
  }

  function find_container(notice){
    var element = document.getElementById(notice.container);
    if (element){
      notice.ad = {node: element, dom_depth: 0, sibling_proximity: 0};
      notice.ad_w = element.offsetWidth;
      notice.ad_h = element.offsetHeight;
    }
    return !!element;
  }

  function is_iframe(notice){
    if (window != window.parent && window.innerWidth == parseInt(notice.ad_w) && window.innerHeight == parseInt(notice.ad_h)){
      notice.is_iframe = true;
      notice.ad = {node: document.body, dom_depth: 0, sibling_proximity: 0};
      // console.log('is_iframe');
      return true;
    }
    return false;
  }

  // (copied from ba.js)
  function isMini(w, h) {
    if (((w >= 728) && (w <= 990)) && ((h >= 90) && (h <= 125))) { return false; }
    if ((w == 160) && (h == 600)) { return false; }

    return (w < 190 || h < 145);
  }

  function look_around_dom(notice){
    //find all dom elements that qualify.
    find_all_potential_ads(notice);
    rate_ad_proximities(notice);
    notice.ad = find_best_ad_fit(notice);
    compare_other_notices(notice);
    return !!notice.ad
  }

  function find_best_ad_fit(notice){
    var winning_node = null;
    for (var i = 0; i < notice.potential_ads.length; i++){
      //is it better than previus ad?
      if (new_ad_is_closer(winning_node, notice.potential_ads[i])){
        winning_node = notice.potential_ads[i];
      }
    }
    return winning_node;
  }
  
  function compare_other_notices(notice){
    if (!notice.ad){return;}
    for (var i = 0; i < AD_PRIVACY.notices.length; i++){
      if (AD_PRIVACY.notices[i] == notice){continue;}
      if (AD_PRIVACY.notices[i].ad && AD_PRIVACY.notices[i].ad.node == notice.ad.node){
        if (new_ad_is_closer(AD_PRIVACY.notices[i].ad, notice.ad)){
          latteral_merge(AD_PRIVACY.notices[i], notice);
          break;
        }else{
          latteral_merge(notice, AD_PRIVACY.notices[i]);
          break;
        }
      }
    }
  }

  function latteral_merge(merging_notice, parent_notice){
    set_ad_src(merging_notice);
    beacon_call(merging_notice, 'I');
    hide_notice_icon(merging_notice);
    var params = package_notice_params(merging_notice);
    attach_notice(parent_notice, params);
  }

  function new_ad_is_closer(old_ad, new_ad){
    if (new_ad.established_elsewhere){return false;}
    if (!old_ad){return true;}
    if (old_ad.dom_depth < new_ad.dom_depth){return true;}
    if (old_ad.dom_depth == new_ad.dom_depth){
      if (Math.abs(old_ad.sibling_proximity) > Math.abs(new_ad.sibling_proximity)){
        return true;
      }else if(Math.abs(old_ad.sibling_proximity) == Math.abs(new_ad.sibling_proximity)){
        if (old_ad.sibling_proximity < new_ad.sibling_proximity){
          return true;
        }
      }
    }
    return false;
  }

  function find_all_potential_ads(notice){
    var everything = document.getElementsByTagName("*"),
      node, width_height;
    for (var i = 0; i < everything.length; i++){
      node = everything[i];
      if (nodeAcceptCheck(node)){
        width_height = getDims(node);
        if (width_height[0] == notice.ad_w && width_height[1] == notice.ad_h){
          if (!notice.is_potential_ad(node)){
            notice.potential_ads.push({node: node});
          }
          
        }
      }
    }
    //keeping only the top level prospects.
    var p_node, c_node;
    for (i = 0; i < notice.potential_ads.length; i++){
      for (var j = 0; j < notice.potential_ads.length; j++){
        if (i == j){continue;}
        p_node = notice.potential_ads[i].node;
        c_node = notice.potential_ads[j].node;
        if (p_node.contains(c_node)){
          notice.potential_ads.splice(j,1);
          if (i > j){i--;}
          j--;
        }
      }
    }
    //throwing out elements inside other ads.
    for (i = 0; i < notice.potential_ads.length; i++){
      for (j = 0; j < AD_PRIVACY.notices.length; j++){
        if (AD_PRIVACY.notices[j] == notice || !AD_PRIVACY.notices[j].ad){continue;}
        if (AD_PRIVACY.notices[j].ad.node.contains(notice.potential_ads[i].node) && AD_PRIVACY.notices[j].ad.node != notice.potential_ads[i].node){
          notice.potential_ads.splice(i,1);
          i--;
        }
      }
    }
  }

  Notice.prototype.is_potential_ad = function(node){
    for (var i = 0; i < this.potential_ads.length; i++){
      if (this.potential_ads[i].node == node){
        return true;
      }
    }
    return false;
  }

  function nodeAcceptCheck(el) {
    return /DIV|IMG|EMBED|OBJECT|IFRAME|CANVAS|VIDEO|svg|ARTICLE|MAIN|ASIDE|FIGURE|NAV|SECTION/.test(el.nodeName);
  }

  function getDims(el) {
    var eh,ew;
    try {
      eh = el.height;
      ew = el.width;

      if (!eh) { eh = parseInt(getStyle(el, 'height')); }
      if (!ew) { ew = parseInt(getStyle(el, 'width')); }

      if (!eh) { eh = el.offsetHeight; }
      if (!ew) { ew = el.offsetWidth; }
    } catch (e) { }

    if (eh && ew){
      return [ew, eh];
    }

    return false;
  }

  function getStyle(el, styleProp) {
    try {
      var y;
      if (el.currentStyle) {
        y = el.currentStyle[styleProp];
      } else if (window.getComputedStyle) {
        y = document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
      }
      if ( (!y) && (styleProp === 'text-align') ) { try { y = el.currentStyle.textAlign; } catch (e) {} }

      return y;
    } catch (e) {
      return null;
    }
  }

  function rate_ad_proximities(notice){
    for (var i = 0; i < notice.potential_ads.length; i++){
      get_proximity_rank(notice.call_script, notice.potential_ads[i]);
    }

    function get_proximity_rank(script, potential_ad){
      var script_parent_chain = get_parent_chain(script);
      var node_parent_chain = get_parent_chain(potential_ad.node);
      //find common parents.
      for (var i = 0; i < script_parent_chain.length; i++){
        for (j =0; j < node_parent_chain.length; j++){
          if (script_parent_chain[i] == node_parent_chain[j]){
            potential_ad.dom_depth = (script_parent_chain.length - i);
            potential_ad.sibling_proximity = node_proximity(script_parent_chain[i-1], node_parent_chain[j-1]);
            return;
          }
        }
      }
    }

    function get_parent_chain(node){
      var chain = [];
      var current_node = node;
      while (current_node.parentNode){
        chain.push(current_node);
        current_node = current_node.parentNode;
      }
      return chain;
    }

    function node_proximity(node1, node2){
      var node1_index = Array.prototype.indexOf.call(node1.parentNode.children, node1);
      var node2_index = Array.prototype.indexOf.call(node2.parentNode.children, node2);
      return (node1_index - node2_index);
    }
  }

  function resize(){
    for (var i = 0; i < AD_PRIVACY.notices.length; i++){
      if(!AD_PRIVACY.notices[i].ad){continue;}
      determine_notice_position(AD_PRIVACY.notices[i]);
      if(AD_PRIVACY.notices[i].overlay && AD_PRIVACY.notices[i].overlay.style.display == 'none'){continue;}
      determine_overlay_position(AD_PRIVACY.notices[i]);
    }
  }

  function close_overlay(event){
    this.__notice.overlay.style.display = 'none';
  }

  function more_info_link_clicked(event){
    var notice = this.__notice;
    beacon_call(notice, 'M');

    var nids = [];// = [notice.nid];
    var vi, p = [], mi = DOMAIN_INFO + 'more_info/'// + notice.nid;
    function add_nid(notice){
      if (nids.indexOf(notice.nid) == -1){nids.push(notice.nid)}
      for (var i = 0; i < notice.attached_notices.length; i++){
        add_nid(notice.attached_notices[i]);
      }
    }

    add_nid(notice);
    mi += nids.join(',');

    // for (var i = 0; i < notice.attached_notices.length; i++){
    //   if (nids.indexOf(notice.attached_notices[i].nid) == -1){
    //     mi += ',' + notice.attached_notices[i].nid;
    //     nids.push(notice.attached_notices[i].nid);
    //   }
    // }

    // Add vendor links
    (vi = vendor(notice, 'cps'))   && p.push(vi);
    (vi = vendor(notice, 'seg'))   && p.push(vi);
    (vi = vendor(notice, 'ecaid')) && p.push(vi);



    function vendor(notice, v) {
      var p = [], key;

      if (notice[v]) {
        p.push(v + '[' + notice.nid + ']=' + encodeURIComponent(notice[v]));
      }

      for (var i = 0; i < notice.attached_notices.length; i++){
        if (notice.attached_notices[i][v]) {
          p.push(vendor(notice.attached_notices[i], v));
          // p.push(v + '[' + notice.attached_notices[i].nid + ']=' + encodeURIComponent(notice.attached_notices[i][v]));
        }
      }
      return p.join('&');
    }


    if (_gdn) { p.push('gdn=1'); }

    if (p.length > 0) {
      mi += '?' + p.join('&');
    }

    if (this.style){
      this.href = mi;
    }else{
      window.open(mi, '_blank');
    }
  }

  

  function about_behavioral_advertising_click(event){
    // console.log('about_behavioral_advertising_click');
    var notice = this.__notice;
    beacon_call(notice, 'B');
    var href = DOMAIN_INFO + 'about_behavioral_advertising/section1?n=' + notice.nid;
    var nids = [notice.nid];
    for (var i = 0; i < notice.attached_notices.length; i++){
      if (nids.indexOf(notice.attached_notices[i].nid) == -1){
        nids.push(notice.attached_notices[i].nid);
        href += (','+notice.attached_notices[i].nid);
      }
    }
    this.href = href;
    // event.preventDefault();
  }


  function adv_link_clicked(event){
    this.href = this.__notice.adv_link;
    beacon_call(this.__notice, 'A');
    // console.log('custom_message_click');
    // event.preventDefault();
  }

  function icon_clicked(event){
    // console.log('icon clicked');
    var notice = this.__notice;
    beacon_call(notice, 'S');
    if (notice.skip_L2){
      more_info_link_clicked.call(notice, notice);
      return;
    }
    if (!notice.overlay){
      createOverlay(notice);
    }else{
      notice.overlay.style.display = 'block';
    }
  }

  function createOverlay(notice){
    if (is_mobile){create_mobile_overlay(notice);return;}
    var reg,
      width = notice.ad_w,
      height = notice.ad_h;

    /* translation scaffold */
    var sc = '[ X ]',
     sm = 'More information &#38; opt-out options',
     sw = 'What is interest based advertising?',
     sl = 'Learn about your choices',
     se = 'Privacy Controls by Ghostery, Inc.&#153;',
     sg1 = 'This ad has been matched to your interests. It was selected for you based on your browsing activity.',
     sg2 = 'This ad may have been matched to your interests based on your browsing activity.',
     sg3 = 'helped',
     sg4 = 'determine that you might be interested in an ad like this.',
     sg5 = 'select this ad for you.',
     sg6 = 'selected this ad for you.';

    var generic_msg = notice.default_generic1;

    function trans(z) {
      try {
        if (!z.generic1) { return; }

        sg1 = z.generic1;
        sg2 = z.generic2;
        sg3 = z.generic3;
        sg4 = z.generic4;
        sg5 = z.generic5;
        sg6 = z.generic6;

        sm = z.link1;
        sw = z.link2;
        sl = z.link3;
        se = z.footer;

        se = se.replace('Evidon', 'Ghostery, Inc');
      } catch (err) {} 
    }

    // // translation layer
    if (!notice['behavioral_' + country]) {
      trans(notice.defTrans);
    }
    trans(notice.translation);
    se = '<span class="bap-gray">' + se + '</span>';

    if (notice.behavioral == 'definitive') {
      generic_msg = sg1;
      if (notice.adv_name) {
        generic_msg += '<br><br>' + notice.server.name + ' ' + sg3 + ' ' + notice.adv_name + ' ' + sg4;
      }
    } else if (notice.behavioral == 'single') {
      generic_msg = sg2;
      if (notice.adv_name) {
        generic_msg += '<br><br>' + notice.adv_name + ' ' + sg6;
      }
    } else if (notice.behavioral == 'uncertain') {
      generic_msg = sg2;

      if (notice.adv_name) {
        generic_msg += '<br><br>' + notice.server.name + ' ' + sg3 + ' ' + notice.adv_name + ' ' + sg5;
      }
    } else if (notice.behavioral == 'custom') {
      generic_msg = notice.behavioralCustomMessage;
    }

    if ( (width >= 190) && (width < 300) && (height >= 145) && (height < 250) ) {
      // Small L2
      reg = 5;
    } else if ( (width >= 300) && (height >= 250) ) {
      // Regular L2
      reg = 1;
    } else {
      reg = 5;
    }
    if ( (width == 160) && (height == 600) ) {
      reg = 2;
    }
    if ( ( (width >= 728) && (width <= 990) ) && ( (height >= 90) && (height <= 125) ) ) {
      reg = 6;
    }

    var overlay_widths = {'1': '276px', '2': '156px', '5': '190px', '6': '728px'};  //NOTE: mayhaps this should be more dynamic, ya know: QuarksMode?

    var wrapper_div = document.createElement('DIV'),
      bap_div = document.createElement('DIV'),
      close_btn = document.createElement('DIV'),
      img_container = document.createElement('DIV'),
      logo_img = document.createElement('IMG'),
      generic_msg_p = document.createElement('P');

    function append_link(innerHTML, click_event){
      var div = document.createElement('DIV');
      var a = document.createElement('A');

      div.className = 'bap-link-div';
      a.className = 'bap-blue';
      a.href = 'about:blank';
      a.target = '_blank';
      a.innerHTML = innerHTML;
      // a.style.cursor = 'pointer';
      if (click_event){
        a.__notice = notice;
        addEvent(a, 'click', click_event);
      }
      div.appendChild(a);
      bap_div.appendChild(div);
    }

    wrapper_div.className = 'bap'+reg+' bap-notice';
    wrapper_div.style.width = overlay_widths[reg];
    wrapper_div.style.position = 'absolute';
    wrapper_div.style.zIndex = (z_depth + 1);

    bap_div.className = 'bap-div';

    close_btn.className = 'bap-close';
    close_btn.innerHTML = '[ X ]';
    close_btn.__notice = notice;
    addEvent(close_btn, 'click', close_overlay);
    bap_div.appendChild(close_btn);
    if (reg != 5){
      if (notice.adv_logo){
        logo_img.style.border = '0';
        logo_img.src = notice.adv_logo;
        if (notice.adv_link && !notice.hide_cl){
          var a = document.createElement('A');
          a.className = 'bap-blue';
          a.target = '_blank';
          a.href = notice.adv_link;
          a.__notice = notice;
          addEvent(a, 'click', adv_link_clicked);
          a.appendChild(logo_img);
          img_container.appendChild(a);
        }else{
          img_container.appendChild(logo_img);
        }
      }
      img_container.className = 'bap-img-container';
      bap_div.appendChild(img_container);

      generic_msg_p.innerHTML = generic_msg;
      bap_div.appendChild(generic_msg_p);

      append_link(sm + ' &raquo;', more_info_link_clicked);

      if (!notice.hide_wi){
        append_link(sw + ' &raquo;', about_behavioral_advertising_click);
      }
      if (!notice.hide_cl){
        if (notice.adv_link && notice.adv_msg){
          append_link(notice.adv_msg + ' &raquo;', adv_link_clicked);
        }else if (notice.adv_msg){
          var bap_link_div_cl = document.createElement('DIV');
          bap_link_div_cl.className = 'bap-link-div';
          bap_link_div_cl.innerHTML = notice.adv_msg;
          bap_div.appendChild(bap_link_div_cl);
        }
      }
    }else {
      generic_msg_p.innerHTML = generic_msg;
      bap_div.appendChild(generic_msg_p);
      // the more info link was missing from ads of a specific size.  this addresses
      // bug #5346 in axosoft.
      append_link(sl + ' &raquo;', more_info_link_clicked);
    }

    var bap_link_div_final = document.createElement('DIV');
    bap_link_div_final.className = 'bap-link-div';
    bap_link_div_final.innerHTML = se;
    bap_div.appendChild(bap_link_div_final);

    if (reg == 6){
      // Super fun dom re-aranging.
      var links = bap_div.getElementsByClassName('bap-link-div');
      var bap_gradient_1 = document.createElement('DIV');
      while (links.length > 0){
        bap_gradient_1.appendChild(links[0]);
      }
      var bap_gradient_2 = document.createElement('DIV');
      while (bap_div.childNodes.length > 0){
        bap_gradient_2.appendChild(bap_div.childNodes[0]);
      }
      bap_gradient_1.id = 'bap-gradient-1';
      bap_gradient_2.id = 'bap-gradient-2';
      bap_gradient_1.className = 'bap-gradient';
      bap_gradient_2.className = 'bap-gradient';
      bap_div.appendChild(bap_gradient_1);
      bap_div.appendChild(bap_gradient_2);
    }
    bap_dom.appendChild(wrapper_div);
    wrapper_div.appendChild(bap_div);

    notice.overlay = wrapper_div;
    determine_overlay_position(notice);
  }

  function create_mobile_overlay(notice){
    if (!notice.display_mobile_overlay || !((notice.ad_h < 50) || (notice.ad_h < 135 && notice.ad_w < 300))) {
      if (notice.overlayed) {
        go_to_L3(null);
      }
      else {
        // show the overlay
        var wrapper_div = document.createElement('DIV');

        wrapper_div.style.position = 'absolute';
        wrapper_div.style.backgroundColor = '#FFFFFF';
        wrapper_div.style.border = 'solid 1px black';
        wrapper_div.style.font = 'bold 10px arial, helvetica'; //<=== may not quite work on all browsers.
        wrapper_div.style.zIndex = (z_depth + 1);

        var close_btn = document.createElement('DIV');
        close_btn.__notice = notice;
        addEvent(close_btn, 'click', close_overlay);
        close_btn.innerHTML = 'X';
        close_btn.style.font = 'bold 14px arial, helvetica';
        close_btn.style.position = 'absolute';
        close_btn.style.padding = '3px';
        close_btn.style.cursor = 'pointer';

        var message_div = document.createElement('DIV');
        message_div.innerHTML = notice.mobile_message;
        message_div.style.position = 'absolute';
        message_div.style.padding = '3px';
        message_div.style.wordWrap = 'break-word';

        var logo_div = document.createElement('DIV');
        logo_div.style.position = 'absolute';
        logo_div.style.width = '115px';
        logo_div.style.padding = '1px';

        var img = document.createElement('IMG');
        img.src = notice.adv_logo;
        img.style.height = '45px';
        img.style.width = '115px';
        img.style.margin = 'auto';
        logo_div.appendChild(img);

        if (notice.ad_h < 120 || notice.ad_w >= 300) {
          wrapper_div.style.width = '298px';
          wrapper_div.style.height = '48px';
          message_div.style.width = '135px';
          if (notice.icon_position.indexOf('right') > -1) {
            logo_div.style.left = message_div.style.right = '15px';
          } else {
            logo_div.style.right = '20px';
          }
        } else {
          wrapper_div.style.width = '118px';
          wrapper_div.style.height = '133px';
          message_div.style.width = '115px';
          logo_div.style.top = '60px';
        }
        message_div.style.top = '15px';

        message_div.__notice = notice;
        logo_div.__notice = notice;
        addEvent(message_div, 'click', go_to_L3);
        addEvent(logo_div, 'click', go_to_L3);
        wrapper_div.appendChild(close_btn);
        wrapper_div.appendChild(message_div);
        wrapper_div.appendChild(logo_div);
        bap_dom.appendChild(wrapper_div);

        notice.overlay = wrapper_div;
        determine_overlay_position(notice);
      }
    }
    else {
      if (notice.expanded) {
        go_to_L3(null);
      }
      else {
        // expand the icon
        expand_icon(null);
      }
    }
  }

  function go_to_L3(event){
    var notice = this.__notice;
    beacon_call(notice, 'M');
    if (in_app) {
      // Android click
      if (navigator.userAgent.indexOf('Android') > -1) {
        var iframe = document.createElement('iframe');
        iframe.style.visibility = 'hidden';
        iframe.style.display = 'none';
        iframe.src = u;
        document.body.appendChild(iframe);
        setTimeout(function(){
        if (typeof mraid !== 'undefined' && mraid.getState() !== 'loading'){
          mraid.open('https://play.google.com/store/apps/details?id=com.DAA.appchoices');
        }else{
          window.location = "https://play.google.com/store/apps/details?id=com.DAA.appchoices";
        }
        },200);
      // iOS click
      } else {
        var goToUrl = function (u) {
          var link = document.createElement('a');
          link.href = u;
          document.body.appendChild(link);
          link.click();
        }
        setTimeout(function(){
          if (typeof mraid !== 'undefined' && mraid.getState() !== 'loading'){
          mraid.open('https://itunes.apple.com/us/app/appchoices/id894822870');
        }else{
          goToUrl("https://itunes.apple.com/us/app/appchoices/id894822870");
        }
        }, 400);
      }
    // Mobile web click
    } else {
      if (navigator.userAgent.match(/iPhone|iPad|iPod/) != null){
        window.open('https://itunes.apple.com/us/app/appchoices/id894822870', '_newtab');
      }else{
        window.open(u, '_newtab');
      }
    }
  }

  // UTILS
  function addEvent(elm, evType, fn) {
    if (elm.addEventListener) {
      elm.addEventListener(evType, fn, false);
    } else {
      evType = 'on' + evType;
      if (elm.attachEvent) {
        elm.attachEvent(evType, fn);
      } else {
        elm[evType] = fn;
      }
    }
  }

  //Beacon Calls

  function beacon_call(notice, action){
    if (notice.beacon_calls[action]){return;}
    set_ad_src(notice);
    notice.beacon_calls[action] = true;

    var pix_src = '//l.betrad.com/ct/';
    pix_src += log_id_string(notice);
    pix_src += ([country, beacon_codes[action], notice.ad_w, notice.ad_h, 242, notice.coid, notice.revision].join('/') + '/');
    pix_src += 'pixel.gif?v=' + version + '&ttid=' + treatment + '&d=' + domain + notice.overwrite + '&a=' + notice.ad_src + '&r=' + Math.random()
    drop_pixel(pix_src);
    if (action != 'S'){
      // if (action == 'I'){action = 'O';}
      for (var i = 0; i < notice.attached_notices.length; i++){
        beacon_call(notice.attached_notices[i], action);
      }
    }
  }

  function log_id_string(notice) { 
    return [ encodeURIComponent(notice.aid || 0), encodeURIComponent(notice.icaid || 0), 
             encodeURIComponent((notice.ecaid || 0)).replace(/_/g, '$underscore$').replace(/%2F/g, '$fs$'),
             encodeURIComponent(notice.nid || 0) ].join("_") + '/';
  }

  function drop_pixel(src){
    // console.log('beacon_call: '+src);
    // return;
    var px = document.createElement('IMG');
    px.width = 0;
    px.height = 0;
    px.style.display = 'none';
    px.src = src;
    document.body.appendChild(px);
  }

  // debug
  function debug_log(){
    try {                                                                                                                     /* NON_PROD */
      if (arguments.length >= 1 || arguments.length <= 3) {                                                                   /* NON_PROD */
        var format = "-- BAP" + ( (window == window.top) ? '' : ' [' + document.location.href + ']' ) + ":  " + arguments[0]; /* NON_PROD */
        if (arguments.length == 1) console.log(format);                                                                       /* NON_PROD */
        else if (arguments.length == 2) console.log(format, arguments[1]);                                                    /* NON_PROD */
        else if (arguments.length == 3) console.log(format, arguments[1], arguments[2]);                                      /* NON_PROD */
      } else {                                                                                                                /* NON_PROD */
        alert("Improper use of trace(): " + arguments.length + " arguments");                                                 /* NON_PROD */
      }                                                                                                                       /* NON_PROD */
    } catch (e) { }                                                                                                           /* NON_PROD */
  }

  API._start = initial_procedures;
  if (window.BAP){
    var old_copyJSON = BAP.copyJSON;
    BAP.copyJSON = function(obj){
      old_copyJSON(obj);
      copyJSON(obj);
    };
  }else{
    BAP = {};
    BAP.copyJSON = copyJSON;
  }
  API.kick_off_notices = kick_off_notices;
  return API;

}());

AD_PRIVACY._start();
