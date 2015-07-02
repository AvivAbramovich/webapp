$(document).ready(function(){
	var openTab = localStorage.getItem('openTab');
	if(openTab ==null)
		openTab = 1;
	var tabSites = JSON.parse(localStorage.getItem('tabSites'));
	if(tabSites == null){
		tabSites = ['[]','','[]',''];	//JSONs array
		localStorage.setItem('tabSites', JSON.stringify(lastTabSites));
	}

	//Properties

	var iframe = $('iframe');	//the iframe

	var buttons = {
		settings : $('#settings-button'),
		openInNewTab : $('#external-button'),
		save : $('#save-button'),
		cancel : $('#cancel-button')
	};

	var sitesSelect = $('select');
	var searchBox = $('.search-box');
	var settingsSection = $('#settings');
	var firstInput = $('#settings li:nth-child(1) input[name="SiteName"]');	//always focus in the beginning of settings

	var isSettingsOpen = false;

	//Properties END

	//consts/defines

	const MAX_SITES_IN_TAB = 3;

		//tabs
		const QUICK_REPORTS = 1;
		const MY_FOLDERS = 2;
		const MY_TEAM_FOLDERS = 3;
		const PUBLIC_FOLDERS = 4;

		//keyboard keys
		const ENTER_KEY = 13;
		const ESCAPE_KEY = 27;
	//consts END

	//methods

	function addOption(siteName, siteURL){
		sitesSelect.append('<option value="'+siteURL+'"">'+siteName+'</option>');
	}

	function saveTabSites(){
		tabSites[openTab-1] = JSON.stringify(currentTabsSite);
		localStorage.setItem('openTab',openTab);
		localStorage.setItem('tabSites', JSON.stringify(tabSites));
	}

	function changeTabFucn(tab){
		$('.tabs > ul li').removeClass('active');
		$('.tabs > ul li:nth-child('+tab+')').addClass('active');
		openTab = tab;
		localStorage.setItem('openTab', openTab);

		if(openTab==QUICK_REPORTS || openTab==MY_TEAM_FOLDERS){
			currentTabsSite = JSON.parse(tabSites[openTab-1]);
			if(currentTabsSite.length == 0){
				isSettingsOpen = true;
				iframe.hide();
				settingsSection.show();
				buttons.openInNewTab.hide();
				sitesSelect.hide();
				buttons.settings.addClass('active');
				firstInput.focus();
			}
			else{
				iframe.attr('src', fixUrl(currentTabsSite[0].siteURL));
				isSettingsOpen = false;
				buttons.settings.removeClass('active');
				settingsSection.hide();
				$('select > option').remove();	//so it won't accidently remove options from the iframe
				for(var i=0; i<currentTabsSite.length; i++){
					if(currentTabsSite[i]!=null){
						$('#settings li:nth-child('+(i+1)+') input[name="SiteName"]').val(currentTabsSite[i].siteName);
						$('#settings li:nth-child('+(i+1)+') input[name="SiteUrl"]').val(currentTabsSite[i].siteURL);
						addOption(currentTabsSite[i].siteName, currentTabsSite[i].siteURL);
					}
				}
				iframe.show();
				sitesSelect.show();
				buttons.openInNewTab.show();
				buttons.settings.show();
			}

			//set the form fields in the settings section
			for(var i=1; i<= MAX_SITES_IN_TAB; i++){
				var siteName = $('#settings li:nth-child('+i+') input[name="SiteName"]');
				var siteURL = $('#settings li:nth-child('+i+') input[name="SiteUrl"]');
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
			iframe.show();
			iframe.attr('src', fixUrl(currentTabsSite));
			settingsSection.hide();
			buttons.settings.hide();
			sitesSelect.hide();
			buttons.openInNewTab.show();
			buttons.settings.removeClass('active');
		}
	}

	function validateURL(textval) 
	//check if the site url the user entered is valid
	//returns true if the URL is valid, or "almost valid" (miss "http://" prefix), false otherwise
	{
      var urlregex = new RegExp(
            "^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
      if(urlregex.test(textval))
      	return true;

      //miss "http://", also acceptable
      urlregex = new RegExp(
            "^([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
      return urlregex.test(textval);
    }

    function fixUrl(url)
    //get a valid url or "almost valid". if it "almost valid", add the "http://" prefix
    {
    	if(!new RegExp(
            "^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$").test(url))
      		return "http://"+url;
      	return url;
    }

    function save()
    //finish the settings form, applying the changes and save it to the localStorage
    //return false (always) so the page won't reload itself
    {
		$('select > option').remove();	//so it won't accidently remove options from the iframe

		var currentTabsSite = [];
		for(var i=1; i<= MAX_SITES_IN_TAB; i++){
			var siteName = $('#settings li:nth-child('+i+') input[name="SiteName"]').val();
			var siteURL = $('#settings li:nth-child('+i+') input[name="SiteUrl"]').val();
			if(siteName!= null && siteName!=""){
				currentTabsSite.push(JSON.parse('{"siteName":"'+ siteName+'","siteURL":"'+siteURL+'"}'));
				addOption(siteName, siteURL);
			}
		}

		saveTabSites();	//save the current tab sites to the local storage

		cancel();	//dismiss the settings form

		//returning false so the page won't reload (image input acts like a submit)
		return false;
	}

	function cancel(){
		if(currentTabsSite.length == 0){
			iframe.hide();
			buttons.openInNewTab.hide();
			sitesSelect.hide();
		}
		else{
			isSettingsOpen = false;
			iframe.show();
			iframe.attr('src', fixUrl(currentTabsSite[0].siteURL));
			settingsSection.hide();
			buttons.settings.show();
			buttons.openInNewTab.show();
			sitesSelect.show();
		}

		buttons.settings.removeClass('active');

		//clean the form
		for(var i=0; i<MAX_SITES_IN_TAB; i++){
			var siteName ="";
			var siteURL = "";
			if(currentTabsSite[i]!=null){
				siteName = currentTabsSite[i].siteName;
				siteURL = currentTabsSite[i].siteURL;
			}
			
			$('#settings li:nth-child('+(i+1)+') input[name="SiteName"]').val(siteName);
			$('#settings li:nth-child('+(i+1)+') input[name="SiteUrl"]').val(siteURL);
		}

		//returning false so the page won't reload (image input acts like a submit)
		return false;
	}

	//methods END

	//OnStart:

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
    	saveTabSites();
	});
	//notification bar END

	//set the tab for the last open tab (from localStorage)
    changeTabFucn(openTab);

    //activing the last open tab (applying CSS rules)
    $('.tabs > ul li:nth-child('+openTab+')').addClass('active');

    //Listener when user typing in the settings form, check what fields are valids
	settingsSection.keyup(function(event){
		if(isSettingsOpen){
    		if(event.which == ENTER_KEY)
			{
				if(!buttons.save.is(':disabled')){
					save();
				}
				return;
			}
			if(event.which == ESCAPE_KEY)
			{
				cancel();
				return;
			}

			var flag = true;

			for(var i=1; i<= MAX_SITES_IN_TAB; i++){	
				var siteName = $('#settings li:nth-child('+i+') input[name="SiteName"]');
				var siteURL = $('#settings li:nth-child('+i+') input[name="SiteUrl"]');
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
				buttons.save.attr('disabled', false);

			}
			else{
				buttons.save.attr('disabled', true);
			}
		}
	});
	
	//on change tab, fire when the user click on one of the four tabs
	$('.tabs > ul li:nth-child(1)').click(function(){changeTabFucn(1)});
	$('.tabs > ul li:nth-child(2)').click(function(){changeTabFucn(2)});
	$('.tabs > ul li:nth-child(3)').click(function(){changeTabFucn(3)});
	$('.tabs > ul li:nth-child(4)').click(function(){changeTabFucn(4)});	

	//buttons onClickListeners
	buttons.save.click(function(){return save();});
	buttons.cancel.click(function(){return cancel();});
	buttons.openInNewTab.click(function(){
		var win = window.open(iframe.attr('src'), '_blank');
  		win.focus();
	});
	buttons.settings.click(function(){
		if(isSettingsOpen){
			if(currentTabsSite.length!=0){
				iframe.show();
				settingsSection.hide();
				buttons.settings.removeClass('active');
				isSettingsOpen = false;
			}
		}
		else{
			buttons.settings.addClass('active');
			settingsSection.show();
			$('#settings li:nth-child(1) input[name="SiteName"]').focus();
			isSettingsOpen = true;			
		}

		//returning false so the page won't reload (image input acts like a submit)
		return false;
	});

	//when option selected, apply it on the iframe
	sitesSelect.change(function(){
		iframe.attr('src',fixUrl($("option:selected").attr('value')));
	});

	//the search form
	searchBox.submit(function(event){
		event.preventDefault();
		var str = $('.search-box input').val().toLowerCase();

		//search in tab 1
		var tab1 = JSON.parse(tabSites[QUICK_REPORTS-1]);
		for(var i=0; i<tab1.length; i++){
			if (tab1[i].siteName.toLowerCase().indexOf(str) >= 0){
				changeTabFucn(QUICK_REPORTS);
				$('#tab-actions > select > option:nth-child('+(i+1)+')').prop('selected', true);
				iframe.attr('src', fixUrl(tab1[i].siteURL));
				return;
			}
		}

		//search in tab 3
		var tab2 = JSON.parse(tabSites[MY_TEAM_FOLDERS-1]);
		for(var i=0; i<tab2.length; i++){
			if (tab2[i].siteName.toLowerCase().indexOf(str) >= 0){
				changeTabFucn(MY_TEAM_FOLDERS);
				$('#tab-actions > select > option:nth-child('+(i+1)+')').prop('selected', true);
				iframe.attr('src', fixUrl(tab2[i].siteURL));
				return;
			}
		}

		//not found, print a message in the notification field
		$('.notifications p').remove();
		$('.notifications').append('<p>'+'The searched report '+$('.search-box input').val()+' was not found</p>');
	});
});