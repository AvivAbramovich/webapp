$(document).ready(function(){
	//Properties

	//the current state of the site
	var currentState = {
		tabSites: null,	//the site(s) in each tab
		openTab : null, //the current open tab
		//1 - quick reports
		//2 - my folders
		//3 - my team folders
		//4 - public folders
	};

	var iframe = $('iframe');	//the iframe

	var buttons = {
		settings : $('#settings-button'),
		openInNewTab : $('#external-button'),
		save : $('#save-button'),
		cancel : $('#cancel-button')
	};

	var settingsFormInputs;	//array of objects that hold the jquery selectors for the input fields in the settings form

	var sitesSelect = $('select');
	var searchBox = $('.search-box');
	var settingsSection = $('#settings');

	var isSettingsOpen = false;

	//Properties END

	//consts/defines

	const MAX_SITES_IN_TAB = 3;

	//tabs
	const QUICK_REPORTS = 1;
	const MY_FOLDERS = 2;
	const MY_TEAM_FOLDERS = 3;
	const PUBLIC_FOLDERS = 4;

	const tabs = ["quick-reports", "my-folders", "my-team-folders", "public-folders"];
	//consts END

	//methods

	function addOption(siteName, siteURL){
		sitesSelect.append('<option value="'+siteURL+'"">'+siteName+'</option>');
	}

	function saveToLocalStorage(){
		localStorage.setItem('webapp', JSON.stringify(currentState));
	}

	function changeTabFucn(tab){
		if(tab == null)
			tab = currentState.openTab;
		$('.tabs > ul li').removeClass('active');
		$('.tabs > ul li:nth-child('+tab+')').addClass('active');
		currentState.openTab = tab;
		var currentTabsSite = currentState.tabSites[tab-1];
		if(tab==QUICK_REPORTS || tab==MY_TEAM_FOLDERS){
			if(currentTabsSite.length == 0){
				isSettingsOpen = true;
				iframe.hide();
				settingsSection.slideDown(200);
				buttons.openInNewTab.hide();
				sitesSelect.hide();
				buttons.settings.addClass('active');
				settingsFormInputs[0].siteName.focus();	//focus on the first input in the form
			}
			else{
				iframe.attr('src', currentTabsSite[0].siteURL);
				isSettingsOpen = false;
				buttons.settings.removeClass('active');
				settingsSection.slideUp(200);
				$('select > option').remove();	//so it won't accidently remove options from the iframe
				for(var i=0; i<currentTabsSite.length; i++){
					if(currentTabsSite[i]!=null){
						settingsFormInputs[i].siteName.val(currentTabsSite[i].siteName);
						settingsFormInputs[i].siteURL.val(currentTabsSite[i].siteURL);
						addOption(currentTabsSite[i].siteName, currentTabsSite[i].siteURL);
					}
				}
				iframe.show();
				sitesSelect.show();
				buttons.openInNewTab.show();
				buttons.settings.show();
			}

			//set the form fields in the settings section
			for(var i=0; i< MAX_SITES_IN_TAB; i++){
				if(i<currentTabsSite.length){
					settingsFormInputs[i].siteName.val(currentTabsSite[i].siteName);
					settingsFormInputs[i].siteURL.val(currentTabsSite[i].siteURL);
				}
				else{
					settingsFormInputs[i].siteName.val('');
					settingsFormInputs[i].siteURL.val('');
				}
			}
		}
		else{
			iframe.show();
			iframe.attr('src', currentTabsSite);
			settingsSection.slideUp(200);
			buttons.settings.hide();
			sitesSelect.hide();
			buttons.openInNewTab.show();
			buttons.settings.removeClass('active');
		}

		window.location.hash = tabs[tab-1];
		saveToLocalStorage();
	}

	function validateURL(textval) 
	//check if the site url the user entered is valid
	{
      var urlregex = new RegExp(
            "^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
      return urlregex.test(textval);
    }

    function spinElement(element){
		$({deg: 0}).animate({deg: 360}, {
	        duration: 500,
	        step: function(now) {
	            element.css({
	                transform: 'rotate(' + now + 'deg)'
	            })}
    	});
	}

    function save()
    //finish the settings form, applying the changes and save it to the localStorage
    //return false (always) so the page won't reload itself
    {
		$('select > option').remove();	//so it won't accidently remove options from the iframe

		var currentTabsSite = [];
		for(var i=0; i< MAX_SITES_IN_TAB; i++){
			if(settingsFormInputs[i].siteName.val()!= null && settingsFormInputs[i].siteName.val()!=""){
				currentTabsSite.push(JSON.parse('{"siteName":"'+ settingsFormInputs[i].siteName.val()+'","siteURL":"'+settingsFormInputs[i].siteURL.val()+'"}'));
				addOption(settingsFormInputs[i].siteName.val(), settingsFormInputs[i].siteURL.val());
			}
		}

		currentState.tabSites[currentState.openTab-1] = currentTabsSite;
		saveToLocalStorage();	//save the current tab sites to the local storage

		cancel();	//dismiss the settings form

		if(currentTabsSite.length != 0)	//show the iframe and load the first site if the form is not empty
		{
			iframe.show();
			iframe.attr('src', currentTabsSite[0].siteURL);
		}

		//returning false so the page won't reload (image input acts like a submit)
		return false;
	}

	function cancel(){
		var currentTabsSite = currentState.tabSites[currentState.openTab-1];

		if(currentTabsSite.length == 0){
			iframe.hide();
			buttons.openInNewTab.hide();
			sitesSelect.hide();
		}
		else{
			isSettingsOpen = false;
			settingsSection.slideUp(200);
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
			
			settingsFormInputs[i].siteName.val(siteName);
			settingsFormInputs[i].siteURL.val(siteURL);
		}

		//spin button
		spinElement(buttons.settings);

		//returning false so the page won't reload (image input acts like a submit)
		return false;
	}

	function onStart(){
		var ls = localStorage.getItem('webapp');	//load content from localStorage
		if(ls == null){
			currentState.openTab = 1;
			currentState.tabSites = [[],'',[],''];
		}
		else
			currentState = JSON.parse(ls);

		var hash = window.location.hash;	//check if user entered a url with anchor
		if(hash.length > 0){
			hash = hash.substr(1);	//remove the '#'
			if(hash === tabs[0])
				currentState.openTab = 1;
			else{
				if(hash === tabs[1])
					currentState.openTab = 2;
				else{
					if(hash === tabs[2])
						currentState.openTab = 3
					else{
						if(hash === tabs[3])
							currentState.openTab = 4;
						else
							console.log('Invalid url anchor. open last opened tab from localStorage');
					}
				}
			}
		}

		//initialize settingsFormInputs
		settingsFormInputs = [];
		for(var i=1; i<= MAX_SITES_IN_TAB; i++){
			var obj = {
				siteName : $('#settings li:nth-child('+i+') input[name="SiteName"]'),
				siteURL : $('#settings li:nth-child('+i+') input[name="SiteUrl"]')
			};
			settingsFormInputs.push(obj);
		}

		// Check for the various File API support.
		$.getJSON("data/config.json", function(json) {
	    	//notification bar
	    	$('.notifications').append('<p>'+json.notification+'</p>');

	    	//quickActions
	    	var quickActions = json.quickActions;
	    	for(var i=0; i<quickActions.length; i++){
	    		var selector = '.nav-section:nth-child('+(i+1)+')';
	    		var currentDiv = quickActions[i];	//for faster access in the next commands
	    		if(currentDiv.icon != null)
	    			$(selector).css('background-image', 'url(img/icons/'+currentDiv.icon+'.png)');
	    		if(currentDiv.actionsLabel != null){
	    			$(selector+' .menu-caption p').empty();
	    			$(selector+' .menu-caption p').append(currentDiv.actionsLabel);
	    		}
	    		if(currentDiv.label != null){
	    			$(selector+' > p').empty();
	    			$(selector+' > p').append(currentDiv.label);
	    		}

	    		//the li
	    		if(currentDiv.actions != null){
		    		$(selector+' .action-list li').remove();
		    		for(var j=0; j< currentDiv.actions.length; j++){
		    			$(selector+' .action-list').append('<li><a href="'+currentDiv.actions[j].url+'">'+currentDiv.actions[j].label+'</a></li>');
		    		}
		    	}
	    	}

	    	//the tabs
	    	var tabsList = json.tabsList;
	    	for(var i=0; i<tabsList.length; i++){
	    		if(tabsList[i].options.url!=null){
	    			currentState.tabSites[i] = tabsList[i].options.url;
	    		}
	    	}
		});
		//notification bar END

		//set the tab for the last open tab (from localStorage)
	    changeTabFucn();

	    //activing the last open tab (applying CSS rules)
	    $('.tabs > ul li:nth-child('+currentState.openTab+')').addClass('active');
	}

	//methods END

	/* -------------------------  EVENTS  -------------------------------*/

    //Listener when user typing in the settings form, check what fields are valids
	settingsSection.keyup(function(event){
		if(isSettingsOpen){
    		
			if(event.which == 27)	//esc key
				return cancel();

			var flag = true;

			for(var i=0; i < MAX_SITES_IN_TAB; i++){	
				//save the siteName and siteURL in local vars so it be shorter
				var siteName = settingsFormInputs[i].siteName;
				var siteURL = settingsFormInputs[i].siteURL;

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
			

			if(flag)
				buttons.save.attr('disabled', false);
			else
				buttons.save.attr('disabled', true);
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
		spinElement(buttons.openInNewTab);
		var win = window.open(iframe.attr('src'), '_blank');
  		win.focus();§§
	});
	buttons.settings.click(function(){
		if(isSettingsOpen){
			if(currentState.tabSites[currentState.openTab-1].length!=0){
				iframe.show();
				settingsSection.slideUp(200);
				buttons.settings.removeClass('active');
				isSettingsOpen = false;
			}
		}
		else{
			buttons.settings.addClass('active');
			settingsSection.slideDown(200);
			settingsFormInputs[0].siteName.focus();	//focus on the first input field in the form
			isSettingsOpen = true;		
		}

		//returning false so the page won't reload (image input acts like a submit)
		return false;
	});

	//when option selected, apply it on the iframe
	sitesSelect.change(function(){
		iframe.attr('src',$("option:selected").attr('value'));
	});

	//the search form
	searchBox.submit(function(event){
		event.preventDefault();
		var str = $('.search-box input').val().toLowerCase();

		//search in tab 1
		var tab1 = currentState.tabSites[QUICK_REPORTS-1];
		for(var i=0; i<tab1.length; i++){
			if (tab1[i].siteName.toLowerCase().indexOf(str) >= 0){
				changeTabFucn(QUICK_REPORTS);
				$('#tab-actions > select > option:nth-child('+(i+1)+')').prop('selected', true);
				iframe.attr('src', tab1[i].siteURL);
				return;
			}
		}

		//search in tab 3
		var tab2 = currentState.tabSites[MY_TEAM_FOLDERS-1];
		for(var i=0; i<tab2.length; i++){
			if (tab2[i].siteName.toLowerCase().indexOf(str) >= 0){
				changeTabFucn(MY_TEAM_FOLDERS);
				$('#tab-actions > select > option:nth-child('+(i+1)+')').prop('selected', true);
				iframe.attr('src', tab2[i].siteURL);
				return;
			}
		}

		//not found, print a message in the notification field
		$('.notifications p').remove();
		$('.notifications').append('<p>'+'The searched report '+$('.search-box input').val()+' was not found</p>');
	});

	//Events end

	//calling onStart
	onStart();
});