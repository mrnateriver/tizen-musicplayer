/*
* Copyright (c) 2016 Evgenii Dobrovidov
* This file is part of "Music Player".
*
* "Music Player" is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* "Music Player" is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with "Music Player".  If not, see <http://www.gnu.org/licenses/>.
*/

var current_path = localStorage.getItem('LAST_PLAYED_PATH');
var current_file_index = null;
var current_dir_files = null; 
var current_dir = null;

var play_button = $("#main #play_current_dir");
var show_player_button = $("#main #show_current_playing");
var file_list = $("#main ul.file-list");

var audio_player = $("#audio_player")[0];

var play_pause_button = $("#player .player-controls .button.play-pause");
var prev_button = $("#player .player-controls .button.prev");
var next_button = $("#player .player-controls .button.next");

var louder_button = $("#player #player_volume_section .higher.button");
var quieter_button = $("#player #player_volume_section .lower.button");
var volume_level = $("#player #player_volume_section .level");

var section_changer = null;

function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function addDirectory(path) {
	var name = path.fullPath;
	if (path.fullPath != '/') {
		var ps = path.fullPath.split('/');
		name = ps[ps.length - 1];	
	}
	
	var localize_dir = false;
	if (path.fullPath.indexOf('/') < 0) {
		localize_dir = true;
	}
	
	var li = $("<li/>");
	li.addClass('folder').addClass('li-has-next-depth').addClass('li-has-multiline');
	
	//var children = files.length ? files.length + ' ' + localize("files_sub") : localize("empty_dir");
	var children = path.length ? path.length + ' ' + localize("files_sub") : localize("empty_dir");
	if (localize_dir) {
		var toloc = path.fullPath;
		if (toloc.indexOf('internal') == 0) {
			toloc = 'internal';
			li.addClass('internal');
		}
		var loc = localize('storage_' + toloc.toLowerCase());
		if (loc) {
			li.html('<a href="#" data-path="' + path.fullPath + '">' + loc + '<span class="li-text-sub">' + children + '</span></a>');	
		} else {
			li.html('<a href="#" data-path="' + path.fullPath + '">' + path.fullPath + '<span class="li-text-sub">' + children + '</span></a>');
		}
		
	} else {
		li.html('<a href="#" data-path="' + path.fullPath + '">' + name + '<span class="li-text-sub">' + children + '</span></a>');
	}
	
	//file_list.append(li);
	addWithSorting(li);
	
	/*var name = path;
	if (path != '/') {
		var ps = path.split('/');
		name = ps[ps.length - 1];	
	}
	
	var localize_dir = false;
	if (path.indexOf('/') < 0) {
		localize_dir = true;
	}
	
	tizen.filesystem.resolve(
		path,
		function (dir) {
			if (dir.isDirectory) {
				var li = $("<li/>");
				li.addClass('folder').addClass('li-has-next-depth').addClass('li-has-multiline');
				
				//var children = files.length ? files.length + ' ' + localize("files_sub") : localize("empty_dir");
				var children = dir.length ? dir.length + ' ' + localize("files_sub") : localize("empty_dir");
				if (localize_dir) {
					var toloc = path;
					if (toloc.indexOf('internal') == 0) {
						toloc = 'internal';
						li.addClass('internal');
					}
					var loc = localize('storage_' + toloc.toLowerCase());
					if (loc) {
						li.html('<a href="#" data-path="' + path + '">' + loc + '<span class="li-text-sub">' + children + '</span></a>');	
					} else {
						li.html('<a href="#" data-path="' + path + '">' + path + '<span class="li-text-sub">' + children + '</span></a>');
					}
					
				} else {
					li.html('<a href="#" data-path="' + path + '">' + name + '<span class="li-text-sub">' + children + '</span></a>');
				}
				
				//file_list.append(li);
				addWithSorting(li);
				
				//dir.listFiles(function (files) { });
			}
		  
		}, function() {
			console.warn('could not read directory: ' + path);
		  
		}, "r"
	);*/	
}

function addFile(path) {
	var ps = path.split('/');
	var name = ps[ps.length - 1];
	
	var es = name.split('.');
	var extension = es[es.length - 1];
	
	var li = $("<li/>");
	li.addClass('file');
	
	var supported = ['AAC', 'AMR', 'MP3', 'OGG', 'WAV', 'WMA', 'M4A', 'MP4'];
	if (supported.indexOf(extension.toUpperCase()) < 0) {
		li.addClass('unknown');
	} else {
		//play_button.removeClass("disabled");
	}
	
	li.html('<a href="#" data-path="' + path + '">' + name + '</a>');

	//file_list.append(li);
	addWithSorting(li);
}

function addBackEntry(path_to) {
	var name = path_to;
	if (path_to != '/') {
		var ps = path_to.split('/');
		name = ps[ps.length - 1];	
	}
	
	var li = $("<li/>");
	li.addClass('back');
	
	if (path_to.indexOf('/') < 0) {
		var toloc = name;
		if (toloc.indexOf('internal') == 0) {
			toloc = 'internal';
		}
		var loc = localize('storage_' + toloc.toLowerCase());
		if (loc) {
			li.html('<a href="#" data-path="' + path_to + '">' + loc + '</a>');	
		} else {
			li.html('<a href="#" data-path="' + path_to + '">' + name + '</a>');
		}
		
	} else {
		li.html('<a href="#" data-path="' + path_to + '">' + name + '</a>');
	}
	
	//file_list.append(li);
	addWithSorting(li);
}

function addWithSorting(extra_item) {
	//var items = file_list.children('li');
	
	if (extra_item) {
		//items = items.add(extra_item);
		extra_item.appendTo(file_list);
	}
	/*items.sort(function(a, b) {
		a = $(a), b = $(b);
		
		if (a.hasClass('back')) {
			return -1;
		}
		if (b.hasClass('back')) {
			return 1;
		}
		
		var an = a.hasClass('folder'),
			bn = b.hasClass('folder');

		if (an == bn) {
			var first_text = a.children('a').not('span').text().toLowerCase();
			var second_text = b.children('a').not('span').text().toLowerCase();
			if(first_text > second_text) {
				return 1;
			}
			if(first_text < second_text) {
				return -1;
			}
			return 0;
		}
		if(bn && !an) {
			return 1;
		}
		if(!bn && an) {
			return -1;
		}
		return 0;
	});

	items.detach().appendTo(file_list);*/
}

function loadPath() {
	file_list.empty();
	//play_button.addClass("disabled"); //we cannot disable button even if no files are found because user may want to play music from all nested folders
	if (current_path == '/' || current_path == null) {
		tizen.filesystem.listStorages(function (storages) {
			for (var i = 0; i < storages.length; i++) {
				if (storages[i].type != "UNMOUNTABLE"/* && storages[i].state != 'REMOVED'*/) {
					var folder = storages[i].label;
					if (folder.indexOf('wgt-') == 0) {//} || folder.indexOf('internal') == 0 || folder.indexOf('ringtones') == 0) {
						continue;
					}
					
					//now find out how many children it has
					//addDirectory(folder);
					tizen.filesystem.resolve(
						folder,
						function (dir) {
							addDirectory(dir);
							
						}, function () {
							//addDirectory({fullPath: folder, length: 0});
							console.warn('could not read directory: ' + folder);
							
						}, "r"
					);
				}
			}
			
		}, function () {
			file_list.text('could not read directory');
		});
		
	} else {
		var ps = current_path.split('/');
		if (ps.length > 1) {
			ps.splice(ps.length - 1, 1);
			addBackEntry(ps.join('/'));	
		} else {
			addBackEntry('/');
		}
		
		//console.log('resolving current_path:');
		//console.log(current_path);
		tizen.filesystem.resolve(
			current_path,
			function (dir) {
				//console.log('resolving directory for files:');
				//console.log(dir);
				if (dir.isDirectory) {
					dir.listFiles(function (files) {
						for (var i = 0; i < files.length; i++) {
							var file = files[i];
							//console.log('found file: ' + file);
							
							if (file.isDirectory) {
								if (file.fullPath.indexOf('/') >= 0) {
									//addDirectory(file.fullPath);	
									addDirectory(file);
								}
								
							}/* else {
								addFile(file.toURI());
							}*/
						}
						//make two loops in order to sort directories to the top
						for (var i = 0; i < files.length; i++) {
							var file = files[i];
							if (!file.isDirectory) {
								addFile(file.toURI());
							}
						}
						
					});
				}
			  
			}, function() {
				console.warn('could not read directory: ' + current_path);
			  
			}, "r"
		);	
	}
}

function buildPlayList(starting_path, finish_callback) {
	//current_dir_files = []; //we must not empty this array because this function is recursive and should add items to it
	if (starting_path == '/' || starting_path == null) {
		tizen.filesystem.listStorages(function (storages) {
			
			//now parse its children
			var temp_storages = [];
			for (var i = 0; i < storages.length; i++) {
				if (storages[i].type == "UNMOUNTABLE" ||
					/*storages[i].state == 'REMOVED' ||*/ 
					storages[i].label.indexOf('wgt-') == 0) {// || 
					//storages[i].label.indexOf('internal') == 0 || 
					//storages[i].label.indexOf('ringtones') == 0) {
					
					continue;
				}
				temp_storages.push(storages[i]);
			}
			
			var closure_root = function (index, td) {
				if (index >= td.length) {
					if ($.isFunction(finish_callback)) {
						finish_callback();
					}
					return;
				}
				buildPlayList(td[index].label, function () {
					closure_root(index + 1, td);
				});
			};
			closure_root(0, temp_storages);
			
			
		}, function () {
			console.warn('could not read directory: ' + starting_path);
			if ($.isFunction(finish_callback)) {
				finish_callback();
			}
		});
		
	} else {
		tizen.filesystem.resolve(
			starting_path,
			function (dir) {
				if (dir.isDirectory) {
					dir.listFiles(function (files) {
						//we need to make sure files in the playlist go in the same order as in file listing, which means we have to sort it alphabetically first
						var temp_files = [];
						var temp_dirs = [];
						for (var i = 0; i < files.length; i++) {
							var file = files[i];
							
							if (!file.isDirectory) {						
								var es = file.name.split('.');
								var extension = es[es.length - 1];
								
								var supported = ['AAC', 'AMR', 'MP3', 'OGG', 'WAV', 'WMA', 'M4A', 'MP4'];
								if (supported.indexOf(extension.toUpperCase()) > -1) {
									temp_files.push(file.toURI());
								}
								
							} else {
								temp_dirs.push(file.fullPath);
							}
						}
						if (temp_files.length > 0) {
							//temp_files.sort();
							
							temp_files.forEach(function (v) { current_dir_files.push(v) }, this);  
							//current_dir_files.push(temp_files);
						}
						if (temp_dirs.length > 0) {
							//make recursion synchronous
							var closure = function (index, td) {
								if (index >= td.length) {
									if ($.isFunction(finish_callback)) {
										finish_callback();
									}
									return;
								}
								buildPlayList(td[index], function () {
									closure(index + 1, td);
								});	
							};
							closure(0, temp_dirs);
							
						} else if ($.isFunction(finish_callback)) {
							finish_callback();
						}
					});
				}
			  
			}, function() {
				console.warn('could not read directory: ' + starting_path);
				if ($.isFunction(finish_callback)) {
					finish_callback();
				}
			  
			}, "r"
		);
	}
}

function playStartingFromFile(file_path, starting_time) {
	if (current_dir_files !== null && current_dir_files.length > 0) {
		var find = current_dir_files.indexOf(file_path);
		if (find > -1) {
			//this file is already in the playlist, simply play it
			if (find != current_file_index) {
				playFile(current_dir_files[find]);
				current_file_index = find;
				
			} else if (audio_player.paused) {
				if (audio_player.readyState == 4) {
					audio_player.play();
					//setChosenVolume();
				}
				play_pause_button.addClass('pause');
			}
			
			$("#player .ui-header .ui-title").text(current_dir);
			
			//form could've shown 'no files' so we have to hide that message
			$("#player .no-files-found-msg").hide();
			
			tau.changePage('#player');
			return;
		}
	}
	
	if (current_path === null) {
		current_path = '/';
	}
	
	var dir_name = current_path;
	if (current_path != '/') {
		var ps = current_path.split('/');
		dir_name = ps[ps.length - 1];	
	}
	if (current_path.indexOf('/') < 0) {
		var toloc = dir_name;
		if (toloc.indexOf('internal') == 0) {
			toloc = 'internal';
		}
		var loc = localize("storage_" + toloc);
		if (loc) {
			$("#player .ui-header .ui-title").text(loc);	
		} else {
			$("#player .ui-header .ui-title").text(dir_name);
		}
		
	} else {
		$("#player .ui-header .ui-title").text(dir_name);	
	}

	current_file_index = 0;
	current_dir_files = [];
	current_dir = null;
	
	buildPlayList(current_path, function () {
		if (current_dir_files.length > 0) {
			//now reset what can be already playing
			audio_player.pause();
			audio_player.src = null;
			$("#song_file").empty();
			$("#song_artist").empty();
			$("#song_title").empty();
			song_position.empty();
			song_duration.empty();
			song_progress.css("width", 0);
			
			if (current_path.indexOf('/') < 0) {
				var toloc = dir_name;
				if (toloc.indexOf('internal') == 0) {
					toloc = 'internal';
				}
				current_dir = localize("storage_" + toloc);
				if (!current_dir) {
					current_dir = dir_name;	
				}
			} else {
				current_dir = dir_name;	
			}
			
			//hide 'not found' message just in case
			$("#player .no-files-found-msg").hide();
			
			//enable 'show player' button
			show_player_button.removeClass('disabled');
			
			//find selected file in current playlist
			var curind = current_dir_files.indexOf(file_path);
			if (curind > -1) {
				current_file_index = curind;
			} else {
				alert('Unable to find selected file.')
			}
			playFile(current_dir_files[current_file_index], starting_time);
		}
		//now we have a playlist, switch to player page
		tau.changePage('#player');
	});
}

function playCurrentDir() {
	if (current_path === null) {
		current_path = '/';
	}
	
	var name = current_path;
	if (current_path != '/') {
		var ps = current_path.split('/');
		name = ps[ps.length - 1];	
	}
	if (current_path.indexOf('/') < 0) {
		var toloc = name;
		if (toloc.indexOf('internal') == 0) {
			toloc = 'internal';
		}
		var loc = localize("storage_" + toloc);
		if (loc) {
			$("#player .ui-header .ui-title").text(loc);	
		} else {
			$("#player .ui-header .ui-title").text(name);
		}
		
	} else {
		$("#player .ui-header .ui-title").text(name);	
	}
	
	var prev_index = current_file_index;
	var prev_dir = current_dir_files;
	
	current_file_index = 0;
	current_dir_files = [];
	
	//build playlist recursively starting from current_path
	(function (prev_index, prev_dir) {
		buildPlayList(current_path, function () {
			
			//console.log(current_dir_files);//DEBUG
			
			if (current_dir_files.length > 0) {
				//now reset what can be already playing
				audio_player.pause();
				audio_player.src = null;
				$("#song_file").empty();
				$("#song_artist").empty();
				$("#song_title").empty();
				song_position.empty();
				song_duration.empty();
				song_progress.css("width", 0);
				
				if (current_path.indexOf('/') < 0) {
					var toloc = name;
					if (toloc.indexOf('internal') == 0) {
						toloc = 'internal';
					}
					current_dir = localize("storage_" + toloc);
					if (!current_dir) {
						current_dir = name;
					}
				} else {
					current_dir = name;	
				}
				
				//hide 'not found' message just in case
				$("#player .no-files-found-msg").hide();
				
				//enable 'show player' button
				show_player_button.removeClass('disabled');
				
				//well, everything's ready, so start playing first file
				playFile(current_dir_files[current_file_index]);
				
			} else {
				$("#player .no-files-found-msg").show();
				//disable 'show player' button only if nothing is playing
				if (prev_dir && prev_dir.length > 0) {
					current_file_index = prev_index;
					current_dir_files = prev_dir;
					
				} else {
					show_player_button.addClass('disabled');
				}
			}
			
			//now we have a playlist, switch to player page
			tau.changePage('#player');
		});
	})(prev_index, prev_dir);
}

function fitArtistTitle(element) {
	element.style.fontSize = '';
	
    var e = element.parentNode,
    	maxWidth = e.offsetWidth - 30,
    	maxHeight = e.offsetHeight,
    	sizeX = element.offsetWidth,
    	sizeY = element.offsetHeight,
    	fontSize = parseInt(document.defaultView.getComputedStyle(element, null).fontSize, 10);
    
    while ((sizeX > maxWidth || sizeY > maxHeight) && fontSize > 14) {
        fontSize -= 1;
        element.style.fontSize = fontSize + "px";
        sizeX = element.offsetWidth;
        sizeY = element.offsetHeight;
    }
    return element;
}

function playFile(path_uri, starting_time) {
	var ps = path_uri.split('/');
	var file_name = ps[ps.length - 1];
	
	$("#song_file").text(file_name);
	
	var manager = tizen.content;
	manager.scanFile(path_uri, function (uri) {
		
		var filter = new tizen.AttributeFilter("contentURI", "EXACTLY", uri);
		manager.find(function (content) {
			//success
			if (content.length > 0) {
				content = content[0];
				
				if (content.artists && content.artists.length > 0) {
					var artist = content.artists.join(', ');
					$("#song_artist").text(artist);
					
					fitArtistTitle($("#song_artist")[0]);
				}
				
				if (content.title && content.title.length > 0) {
					var song = content.title;
					$("#song_title").text(song);				
				}				
			}

			audio_player.src = path_uri;
			
			if (starting_time !== null && +starting_time > 0) {
				audio_player.currentTime = starting_time;
			}
			
			audio_player.play();
			//setChosenVolume();
			//play_pause_button.addClass('pause');
			
		}, function () {
			//error
			console.warn("couldn't play file: " + path_uri);
			alert('Unable to play file!');
			
		}, null, filter);
		
	}, function () {
		//error
		console.warn("couldn't scan file: " + path_uri);
		//alert('Unable to get file metadata!');
		var supported = ['AAC', 'AMR', 'MP3', 'OGG', 'WAV', 'WMA', 'M4A', 'MP4'];
		var ext = path_uri.substring(path_uri.length - 3, path_uri.length);
		if (supported.indexOf(ext.toUpperCase()) > -1) {
			audio_player.src = path_uri;
			
			audio_player.play();
			//setChosenVolume();
		} else {
			alert('Unsupported file!');
		}
	});
}

function playPauseSong() {
	if (audio_player.paused) {
		if (audio_player.readyState == 4) {
			audio_player.play();
			//setChosenVolume();
		}
		$(this).addClass('pause');
		
	} else {
		audio_player.pause();
		$(this).removeClass('pause');
	}
}

function prevSong() {
	if (current_dir_files.length > 0) {
		current_file_index--;
		if (current_file_index < 0) {
			current_file_index = current_dir_files.length - 1;
		}
		playFile(current_dir_files[current_file_index]);		
	}
}

function nextSong() {
	if (current_dir_files.length > 0) {
		current_file_index++;
		if (current_file_index >= current_dir_files.length) {
			current_file_index = 0;
		}
		playFile(current_dir_files[current_file_index]);
	}
}

function pad(num, size) {
	return ('000000000' + num).substr(-size);
}

function recalcSecondsToMinutes(seconds) {
	var minutes = Math.floor(seconds / 60);
	var seconds = seconds - minutes * 60;
	return minutes + ":" + pad(seconds, 2);
}

function updatePlaybackProgress() {
	var curTime = Math.floor(audio_player.currentTime);
	var duration = Math.floor(audio_player.duration);
	
	var progress = Math.ceil(curTime / duration * 100);
	song_progress.css("width", progress+"%");
	
	song_position.text(recalcSecondsToMinutes(curTime));
}

function playbackEnded() {
	console.log("playbackEnded");
	nextSong();
}

function playbackStarted() {
	console.log("playbackStarted");
	if (audio_player.error === null) {
		play_pause_button.addClass('pause');
		//setChosenVolume();
	}
}

function playbackReady() {
	console.log("playbackReady");
	setChosenVolume();
}


function playbackPaused() {
	console.log("playbackPaused");
	play_pause_button.removeClass('pause');
}

function playbackError() {
	console.log("playbackError");
	$("#song_title").empty();
	song_position.empty();
	song_duration.empty();
	song_progress.css("width", 0);
	play_pause_button.removeClass('pause');
	
	alert('Unable to play file, sorry.');
	console.warn('error on playback:');
	console.warn(audio_player.error);
}

var song_position = $("#player .song-progress .position");
var song_progress = $("#player .song-progress .progress .progress-bar");
var song_duration = $("#player .song-progress .duration");

function songLoaded() {
	console.log("songLoaded");
	
	song_position.text("0:00");
	
	var duration = Math.floor(audio_player.duration);
	song_duration.text(recalcSecondsToMinutes(duration));
	
	song_progress.css("width", 0);
}

function showPlayerPage() {
	if (!$(this).hasClass('disabled')) {
		//reset some things before changing to player
		$("#player .ui-header .ui-title").text(current_dir);
				
		//form could've shown 'no files' so we have to hide that message
		$("#player .no-files-found-msg").hide();
		
		tau.changePage('#player');	
	}
}

function initApplication(callback) {
	if (typeof LANG_CODE === 'undefined' || typeof LANG_STRINGS === 'undefined') {
	    var head = document.getElementsByTagName('head')[0],
	    	script = document.createElement('script');
	    
	    script.type = 'text/javascript';
	    script.src = 'locales/en/language.js';

	    script.onreadystatechange = callback;
	    script.onload = callback;

	    head.appendChild(script);
		
	} else {
		callback();
	}
}

function localize(str) {
	if (LANG_STRINGS && str in LANG_STRINGS) {
		return LANG_STRINGS[str];
	}
}

function localizeUI() {
	var localizable = document.querySelectorAll("[data-localize]");
    if (localizable) {
        for (var i = 0; i < localizable.length; i++) {
            var node = localizable[i],
                str = node.dataset.localize;

            if (str in LANG_STRINGS && node.childNodes) {
                for (var j = 0; j < node.childNodes.length; j++) {
                    var child = node.childNodes[j];
                    if (child.nodeType === 3) {
                        child.nodeValue = LANG_STRINGS[str];
                        break;
                    }
                }
            }
        }
    }
}

function onUnload() {
	console.log('unload event');
	if (audio_player !== null && current_dir_files !== null && current_dir_files.length > 0 && current_file_index >= 0) {
		console.log('unload with player');
		var file = current_dir_files[current_file_index];
		var time = audio_player.currentTime;
		
		localStorage.setItem("CURRENTLY_PLAYING_FILE", file);
		localStorage.setItem("CURRENTLY_PLAYING_TIME", time);
	} else {
		console.log('unload without player');
		localStorage.removeItem("CURRENTLY_PLAYING_FILE");
		localStorage.removeItem("CURRENTLY_PLAYING_TIME");
	}
}

function shownPlayerPage() {
	if (!section_changer) {
		var player_content = $("#player .ui-content").get(0);
		section_changer = new tau.widget.SectionChanger(player_content, {
			circular: false,
			orientation: "horizontal",
			scrollbar: "tab"
		});	
	}
}

function hiddenPlayerPage() {
	if (section_changer) {
		section_changer.destroy();
		section_changer = null;
	}
}

function setChosenVolume() {
	var last_volume = localStorage.getItem('LAST_PLAYED_VOLUME');
	if (last_volume !== null) {
		audio_player.volume = +last_volume * 0.05;
		volume_level.text(last_volume);
	} else {
		audio_player.volume = 1.0;
		volume_level.text("20");
		localStorage.setItem('LAST_PLAYED_VOLUME', 20);
	}
}

function makePlayerLouder() {
	var last_volume = +volume_level.text() + 1;
	if (last_volume > 20) {
		last_volume = 20;
	}
	
	audio_player.volume = last_volume * 0.05;
	volume_level.text(last_volume);
	
	localStorage.setItem('LAST_PLAYED_VOLUME', last_volume);
}

function makePlayerQuieter() {
	var last_volume = +volume_level.text() - 1;
	if (last_volume < 0) {
		last_volume = 0;
	}
	
	audio_player.volume = last_volume * 0.05;
	volume_level.text(last_volume);
	
	localStorage.setItem('LAST_PLAYED_VOLUME', last_volume);
}

$(function () {
	initApplication(function () {
		//window.addEventListener('unload', onUnload);
		//window.onbeforeunload = onUnload;
		//$(window).unload(onUnload);
		
		window.addEventListener('tizenhwkey', function(ev) {
	        if (ev.keyName == "back") {
	            var page = document.getElementsByClassName('ui-page-active')[0],
	                pageid = page ? page.id : "";
	            if (pageid === "main") {
	                try {
	                	//onUnload();
	                    tizen.application.getCurrentApplication().exit();
	                } catch (ignore) {}
	            } else {
	                tau.back();
	            }
	        }
	    });
		tau.defaults.pageTransition = "slideup";
		
		tizen.systeminfo.getPropertyValue("DISPLAY", function (screen) {
			if (screen.resolutionWidth < 360) {
				$("body").addClass('small-screen');
			}
		});
		
		file_list.on('click', "li > a", function (e) {
			var path = this.dataset.path;
			if (!$(this).parents("li").hasClass('file')) {
				current_path = path;
				localStorage.setItem('LAST_PLAYED_PATH', current_path);
				
				loadPath();
				
			} else if (!$(this).parents("li").hasClass('unknown')) {
				playStartingFromFile(path);
			}
			e.preventDefault();
			return true;
		});
		
		document.getElementById("player").addEventListener('pageshow', shownPlayerPage);
		//document.getElementById("player").addEventListener('pagehide', hidePlayerPage);
		
		setChosenVolume();
		
		play_button.click(playCurrentDir);
		show_player_button.click(showPlayerPage);
		
		play_pause_button.click(playPauseSong);
		prev_button.click(prevSong);
		next_button.click(nextSong);
		
		louder_button.click(makePlayerLouder);
		quieter_button.click(makePlayerQuieter);
		
		audio_player.addEventListener('timeupdate', updatePlaybackProgress);
		audio_player.addEventListener('ended', playbackEnded);
		audio_player.addEventListener('loadeddata', playbackReady);
		audio_player.addEventListener('loadedmetadata', songLoaded);
		audio_player.addEventListener('play', playbackStarted);
		audio_player.addEventListener('pause', playbackPaused);
		audio_player.addEventListener('error', playbackError);
		//audio_player.addEventListener('pause', playbackReady);
		
		//load current directory listing
		loadPath();
		
		localizeUI();
		
		/*var curfile = localStorage.getItem("CURRENTLY_PLAYING_FILE");
		var curtime = localStorage.getItem("CURRENTLY_PLAYING_TIME");
		if (curfile !== null && curtime !== null && +curtime > 0 && curfile.trim()) {
			playStartingFromFile(curfile, curtime);
		}*/
	});
});