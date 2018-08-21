/*$(document).ready(function () {
    initYoutube();
});

function initYoutube() {
    $('.create-video-playlist').click(function (e) {
        e.preventDefault();
        alert('Not implemented');
    });
}*/

/***** START BOILERPLATE CODE: Load client library, authorize user. *****/

    // Global variables for GoogleAuth object, auth status.
var GoogleAuth;

/**
 * Load the API's client and auth2 modules.
 * Call the initClient function after the modules load.
 */
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    // Initialize the gapi.client object, which app uses to make API requests.
    // Get API key and client ID from API Console.
    // 'scope' field specifies space-delimited list of access scopes

    gapi.client.init({
        'clientId': '840608930739-12c2gdat8sefu73ddbos0ci7i3dk0qa4.apps.googleusercontent.com',
        'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
        'scope': 'https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtubepartner'
    }).then(function () {
        GoogleAuth = gapi.auth2.getAuthInstance();

        // Listen for sign-in state changes.
        GoogleAuth.isSignedIn.listen(updateSigninStatus);

        // Handle initial sign-in state. (Determine if user is already signed in.)
        setSigninStatus();

        // Call handleAuthClick function when user clicks on "Authorize" button.
        $('#execute-request-button').click(function () {
            $('#youtubeImportContent').html('<div class="col-sm-2 offset-sm-5"><div class="loader-animation"></div></div>');
            handleAuthClick(event);
        });
    });
}

function handleAuthClick(event) {
    // Sign user in after click on auth button.
    if (isAuthorized) {
        defineRequest();
    } else {
        GoogleAuth.signIn();
    }
}

function setSigninStatus() {
    var user = GoogleAuth.currentUser.get();
    isAuthorized = user.hasGrantedScopes('https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtubepartner');
    // Toggle button text and displayed statement based on current auth status.
    if (isAuthorized) {
        //defineRequest();
    }
}

function updateSigninStatus(isSignedIn) {
    setSigninStatus();
}

function createResource(properties) {
    var resource = {};
    var normalizedProps = properties;
    for (var p in properties) {
        var value = properties[p];
        if (p && p.substr(-2, 2) == '[]') {
            var adjustedName = p.replace('[]', '');
            if (value) {
                normalizedProps[adjustedName] = value.split(',');
            }
            delete normalizedProps[p];
        }
    }
    for (var p in normalizedProps) {
        // Leave properties that don't have values out of inserted resource.
        if (normalizedProps.hasOwnProperty(p) && normalizedProps[p]) {
            var propArray = p.split('.');
            var ref = resource;
            for (var pa = 0; pa < propArray.length; pa++) {
                var key = propArray[pa];
                if (pa == propArray.length - 1) {
                    ref[key] = normalizedProps[p];
                } else {
                    ref = ref[key] = ref[key] || {};
                }
            }
        }
        ;
    }
    return resource;
}

function removeEmptyParams(params) {
    for (var p in params) {
        if (!params[p] || params[p] == 'undefined') {
            delete params[p];
        }
    }
    return params;
}

function executeRequest(request, onSuccess) {
    request.execute(function (response) {
        console.log(response);
        if (onSuccess) {
            onSuccess(response);
        }
    });
}

function buildApiRequest(requestMethod, path, params, properties, onSuccess) {
    params = removeEmptyParams(params);
    var request;
    if (properties) {
        var resource = createResource(properties);
        request = gapi.client.request({
            'body': resource,
            'method': requestMethod,
            'path': path,
            'params': params
        });
    } else {
        request = gapi.client.request({
            'method': requestMethod,
            'path': path,
            'params': params
        });
    }
    executeRequest(request, onSuccess);
}

/***** END BOILERPLATE CODE *****/


function defineRequest() {
    buildApiRequest('GET',
        '/youtube/v3/playlists',
        {
            'mine': 'true',
            'maxResults': '25',
            'part': 'snippet,contentDetails',
            'onBehalfOfContentOwner': '',
            'onBehalfOfContentOwnerChannel': ''
        }, null, function (response) {
            let youtubeImportContent = $('#youtubeImportContent');
            youtubeImportContent.html('<ul id="preview-youtube-playlists" class="list-inline">');
            response.items.forEach(function (v) {
                youtubeImportContent.append('<li class="list-inline-item"><p><img src="' + v.snippet.thumbnails.medium.url + '"></p>' +
                    '<p><button type="button" class="btn btn-primary receive-youtube-playlist-videos" data-id="' + v.id + '">Receive videos</button></p>' +
                    '</li>');

            });
            youtubeImportContent.append('</ul>');
        });
}

$('#youtubeImportModal').on('click', '.receive-youtube-playlist-videos', function () {
    let id = $(this).attr('data-id');
    if (!id) {
        alert('Incorrect playlist id');

        return;
    }

    $('#youtubePlaylistVideos').html('<div class="col-sm-2 offset-sm-5"><div class="loader-animation"></div></div>');
    buildApiRequest('GET',
        '/youtube/v3/playlistItems',
        {
            'maxResults': '25',
            'part': 'snippet,contentDetails',
            'playlistId': id
        }, null, function (response) {
            let videos = $('#youtubePlaylistVideos');
            videos.html('<p><button type="button" class="btn btn-success btn-import-all-videos">Import all videos</button></p>' +
                '<ul id="preview-youtube-videos" class="list-inline">');
            response.items.forEach(function (v) {
                videos.append('<li class="list-inline-item youtube-video-import" data-id="' + v.contentDetails.videoId + '" data-cover-file="' + v.snippet.thumbnails.medium.url + '"><p><img src="' + v.snippet.thumbnails.medium.url + '"></p>' +
                    '</li>');

            });
            videos.append('</ul>');
        });
});