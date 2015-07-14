$(document).ready(function(){
	var openTab = localStorage.getItem('openTab');
	if(openTab === null)
		openTab = 1;
	var tabSites = JSON.parse(localStorage.getItem('tabSites'));
	if(tabSites === null){
		tabSites = ['[]','','[]',''];	//JSONs array
		localStorage.setItem('tabSites', JSON.stringify(tabSites));
	}

	var isSettingsOpen = false;

	// Check for the various File API support.
	$.getJSON("data/config.json", function(json) {
    	//notification bar
    	$('.notifications').append('<p>'+json.notification+'</p>');

    	//quickActions
    	var quickActions = json.quickActions;
    	for(var i=0; i<quickActions.length; i++){
    		var selector = '.nav-section:nth-child('+(i+1)+')';
    		//$(selector+' > p').text(quickActions[i].label);	//not good, it just change the text but the html tags shown as plaintext

    		//the li
    		$(selector+' .action-list li').remove();
    		for(var j=0; j< quickActions[i].actions.length; j++){
    			$(selector+' .action-list').append('<li><a href="'+quickActions[i].actions[j].url+'">'+quickActions[i].actions[j].label+'</a></li>');
    		}
    	}

    	//the tabs
    	var tabsList = json.tabsList;
    	for(var i=0; i<tabsList.length; i++){
    		if(tabsList[i].options.url!=null){
    			tabSites[i] = tabsList[i].options.url;
    		}
    	}
    	localStorage.setItem('tabSites', JSON.stringify(tabSites));
	});
	//notification bar END

	function addOption(siteName, siteURL){
		$('select').append('<option value="'+siteURL+'"">'+siteName+'</option>');
	}

	function saveTabSites(){
		tabSites[openTab-1] = JSON.stringify(currentTabsSite);
		localStorage.setItem('openTab',openTab);
		localStorage.setItem('tabSites', JSON.stringify(tabSites));
	}

	function changeTabFucn(tab){
		console.log('chacgeTab '+tab);
		$('.tabs > ul li').removeClass('active');
		$('.tabs > ul li:nth-child('+tab+')').addClass('active');
		openTab = tab;
		localStorage.setItem('openTab', openTab);

		if(openTab==1 || openTab==3){
			currentTabsSite = JSON.parse(tabSites[openTab-1]);
			if(currentTabsSite.length == 0){
				isSettingsOpen = true;
				$('iframe').hide();
				$('.settings').show();
				$('#externalBtn').hide();
				$('select').hide();
				$('#settingsBtn').addClass('active');
				$('.settings li:nth-child(1) input[name="SiteName"]').focus();
			}
			else{
				$('iframe').attr('src', currentTabsSite[0].siteURL);
				isSettingsOpen = false;
				$('#settingsBtn').removeClass('active');
				$('.settings').hide();
				$('select > option').remove();	//so it won't accidently remove options from the iframe
				for(var i=0; i<currentTabsSite.length; i++){
					if(currentTabsSite[i]!=null){
						$('.settings li:nth-child('+(i+1)+') input[name="SiteName"]').val(currentTabsSite[i].siteName);
						$('.settings li:nth-child('+(i+1)+') input[name="SiteUrl"]').val(currentTabsSite[i].siteURL);
						addOption(currentTabsSite[i].siteName, currentTabsSite[i].siteURL);
					}
				}
				$('iframe').show();
				$('select').show();
				$('#externalBtn').show();
				$('#settingsBtn').show();
			}

			//set the form fields in the settings section
			for(var i=1; i<= 3; i++){
				var siteName = $('.settings li:nth-child('+i+') input[name="SiteName"]');
				var siteURL = $('.settings li:nth-child('+i+') input[name="SiteUrl"]');
				if(i<=currentTabsSite.length){
					siteName.val(currentTabsSite[i-1].siteName);
					siteURL.val(currentTabsSite[i-1].siteURL);
				}
				else{
					siteName.val('');
					siteURL.val('');
				}
			}
		}
		else{
			currentTabsSite = tabSites[openTab-1];
			$('iframe').show();
			$('iframe').attr('src',currentTabsSite);
			$('.settings').hide();
			$('#settingsBtn').hide();
			$('select').hide();
			$('#externalBtn').show();
			$('#settingsBtn').removeClass('active');
		}
	}

	function validateURL(textval) {
      var urlregex = new RegExp(
            "^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
      return urlregex.test(textval);
    }

    function save(){
		$('select > option').remove();	//so it won't accidently remove options from the iframe

		var list = $('.settings');
		currentTabsSite = [];
		for(var i=1; i<= 3; i++){
			var selector = '.settings li:nth-child('+i+')';
			var siteName = $('.settings li:nth-child('+i+') input[name="SiteName"]').val();
			var siteURL = $('.settings li:nth-child('+i+') input[name="SiteUrl"]').val();
			if(siteName!= null && siteName!=""){
				currentTabsSite.push(JSON.parse('{"siteName":"'+ siteName+'","siteURL":"'+siteURL+'"}'));
				addOption(siteName, siteURL);
			}
		}

		saveTabSites();	//save the current tab sites to the local storage

		cancel();
	}

	function cancel(){
		console.log('cancel');
		if(currentTabsSite.length == 0){
			$('iframe').hide();
			$('#externalBtn').hide();
			$('select').hide();
		}
		else{
			isSettingsOpen = false;
			$('iframe').show();
			$('iframe').attr('src', currentTabsSite[0].siteURL);
			$('.settings').hide();
			$('#settingsBtn').show();
			$('#externalBtn').show();
			$('select').show();
		}

		$('#settingsBtn').removeClass('active');

		//clean the form
		for(var i=0; i<3; i++){
			var siteName ="";
			var siteURL = "";
			if(currentTabsSite[i]!=null){
				siteName = currentTabsSite[i].siteName;
				siteURL = currentTabsSite[i].siteURL;
			}
			
			$('.settings li:nth-child('+(i+1)+') input[name="SiteName"]').val(siteName);
			$('.settings li:nth-child('+(i+1)+') input[name="SiteUrl"]').val(siteURL);
		}
	}

    changeTabFucn(openTab);


    $('.tabs > ul li:nth-child('+openTab+')').addClass('active');

	$('.settings').keyup(function(event){
		if(isSettingsOpen){
    		if(event.which == 13)//enter
			{
				console.log('save button disabled? '+$('saveBtn').hasClass('disabled'));
				if($('saveBtn').hasClass('disabled')!)
					save();
				return;
			}
			if(event.which == 27)//Esc
			{
				cancel();
				return;
			}

			var flag = true;

			for(var i=1; i<= 3; i++){
				var selector = '.settings li:nth-child('+i+')';
				var siteName = $('.settings li:nth-child('+i+') input[name="SiteName"]');
				var siteURL = $('.settings li:nth-child('+i+') input[name="SiteUrl"]');
				siteName.removeClass('alertHighlight');
				siteURL.removeClass('alertHighlight');
				
				if((siteURL.val()!="" && siteName.val()=="") || (siteURL.val()=="" && siteName.val()!="") ||
					(siteURL.val()!="" && !validateURL(siteURL.val()))){
					flag = false;
					
					if(siteURL.val()!="" && siteName.val()==""){
						siteName.addClass('alertHighlight');
					}
					if((siteURL.val()=="" && siteName.val()!="") || (siteURL.val()!="" && !validateURL(siteURL.val()))){
						siteURL.addClass('alertHighlight');
					}
				}
			}
			

			if(flag){
				$('#saveBtn').attr('disabled', false);

			}
			else{
				$('#saveBtn').attr('disabled', true);
			}
		}
	});
	
	//on change tab
	$('.tabs > ul li:nth-child(1)').click(function(){changeTabFucn(1)});
	$('.tabs > ul li:nth-child(2)').click(function(){changeTabFucn(2)});
	$('.tabs > ul li:nth-child(3)').click(function(){changeTabFucn(3)});
	$('.tabs > ul li:nth-child(4)').click(function(){changeTabFucn(4)});	

	$("#saveBtn").click(function(){save();});
	$("#cancelBtn").click(function(){cancel();});

	$("option:selected").each(function(){
		$("iframe").attr('src',$(this).attr('value'));
	})

	$("select").change(function(){
		$("iframe").attr('src',$("option:selected").attr('value'));
	});

	//open in a new tab
	$('#externalBtn').click(function(){
		var url = $('iframe').attr('src');
		var win = window.open(url, '_blank');
  		win.focus();
	});

	//settings button
	$('#settingsBtn').click(function(){
		if(isSettingsOpen){
			if(currentTabsSite.length!=0){
				$('iframe').show();
				$('.settings').hide();
				$('#settingsBtn').removeClass('active');
				isSettingsOpen = false;
			}
		}
		else{
			$('#settingsBtn').addClass('active');
			$('.settings').show();
			$('.settings li:nth-child(1) input[name="SiteName"]').focus();
			isSettingsOpen = true;			
		}
	});

	//the search form
	$('.search-box').submit(function(event){
		event.preventDefault();
		var str = $('.search-box input').val().toLowerCase();

		//search in tab 1
		var tab1 = JSON.parse(tabSites[0]);
		for(var i=0; i<tab1.length; i++){
			if (tab1[i].siteName.toLowerCase().indexOf(str) >= 0){
				changeTabFucn(1);
				$('#tab-actions > select > option:nth-child('+(i+1)+')').prop('selected', true);
				console.log('src: '+tab1[i].SiteURL);
				$('iframe').attr('src', tab1[i].siteURL);
				return;
			}
		}

		//search in tab 3
		var tab2 = JSON.parse(tabSites[2]);
		for(var i=0; i<tab2.length; i++){
			if (tab2[i].siteName.toLowerCase().indexOf(str) >= 0){
				changeTabFucn(3);
				$('#tab-actions > select > option:nth-child('+(i+1)+')').prop('selected', true);
				$('iframe').attr('src', tab2[i].siteURL);
				return;
			}
		}

		//not found, print a message in the notification field
		$('.notifications p').remove();
		$('.notifications').append('<p>'+'The searched report '+$('.search-box input').val()+' was not found</p>');
	});
});