"use strict";const e=require("electron");if(process.type!=="renderer")throw new Error("This module can only be used from the renderer process");class m{set(n,r){return e.ipcRenderer.send("settings:set",n,r)}async get(n){return await e.ipcRenderer.invoke("settings:get",n)}reset(n){return e.ipcRenderer.send("settings:reset",n)}onDidAnyChange(n){return e.ipcRenderer.on("settings:stateChanged",(r,s,d)=>{n(s,d)})}}const y=`/* eslint-disable @typescript-eslint/no-unused-expressions */
(function () {
  function isExperimentEnabled(experimentFlag) {
    const flag = window.ytcfg.data_.EXPERIMENT_FLAGS[experimentFlag];
    if (flag && typeof flag === "string") return flag === "false" ? false : true;
    return !!flag;
  }

  const ytmStore = window.__YTMD_HOOK__.ytmStore;

  let ytmdControlButtons = {};

  let currentVideoId = "";

  let libraryFeedbackDefaultToken = "";
  let libraryFeedbackToggledToken = "";

  let sleepTimerTimeout = null;

  let libraryButton = document.createElement("yt-button-shape");
  libraryButton.classList.add("ytmd-player-bar-control");
  libraryButton.classList.add("library-button");
  let libraryButtonData = {
    focused: false,
    iconPosition: "icon-only",
    onTap: function () {
      var closePopupEvent = {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: {
          actionName: "yt-close-popups-action",
          args: [["ytmusic-menu-popup-renderer"]],
          optionalAction: false,
          returnValue: []
        }
      };
      var feedbackEvent = {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: {
          actionName: "yt-service-request",
          args: [
            this,
            {
              feedbackEndpoint: {
                feedbackToken: libraryButtonData.toggled ? libraryFeedbackToggledToken : libraryFeedbackDefaultToken
              }
            }
          ],
          optionalAction: false,
          returnValue: []
        }
      };
      this.dispatchEvent(new CustomEvent("yt-action", closePopupEvent));
      this.dispatchEvent(new CustomEvent("yt-action", feedbackEvent));
      window.__YTMD_HOOK__.ytmStore.dispatch({
        type: "SET_FEEDBACK_TOGGLE_STATE",
        payload: { defaultEndpointFeedbackToken: libraryFeedbackDefaultToken, isToggled: !libraryButtonData.toggled }
      });
    }.bind(libraryButton),
    style: "mono",
    toggled: false,
    toggleable: true,
    type: "text"
  };
  libraryButton.rawProps = {
    iconName: "yt-sys-icons:library_add",
    data: libraryButtonData
  };
  document
    .querySelector("ytmusic-app-layout>ytmusic-player-bar")
    .querySelector("ytmusic-like-button-renderer")
    .insertAdjacentElement("afterend", libraryButton);

  let playlistButton = document.createElement("yt-button-shape");
  playlistButton.classList.add("ytmd-player-bar-control");
  playlistButton.classList.add("playlist-button");
  let playlistButtonData = {
    focused: false,
    iconPosition: "icon-only",
    onTap: function () {
      var closePopupEvent = {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: {
          actionName: "yt-close-popups-action",
          args: [["ytmusic-menu-popup-renderer"]],
          optionalAction: false,
          returnValue: []
        }
      };
      var returnValue = [];
      var serviceRequestEvent = {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: {
          actionName: "yt-service-request",
          args: [
            this,
            {
              addToPlaylistEndpoint: {
                videoId: currentVideoId
              }
            }
          ],
          optionalAction: false,
          returnValue
        }
      };
      this.dispatchEvent(new CustomEvent("yt-action", closePopupEvent));
      this.dispatchEvent(new CustomEvent("yt-action", serviceRequestEvent));
      returnValue[0].ajaxPromise.then(
        response => {
          var addToPlaylistEvent = {
            bubbles: true,
            cancelable: false,
            composed: true,
            detail: {
              actionName: "yt-open-popup-action",
              args: [
                {
                  openPopupAction: {
                    popup: {
                      addToPlaylistRenderer: response.data.contents[0].addToPlaylistRenderer
                    },
                    popupType: "DIALOG"
                  }
                },
                this
              ],
              optionalAction: false,
              returnValue: []
            }
          };
          this.dispatchEvent(new CustomEvent("yt-action", addToPlaylistEvent));
          this.dispatchEvent(new CustomEvent("yt-action", closePopupEvent));
        },
        () => {
          // service request errored
        },
        this
      );
    }.bind(playlistButton),
    style: "mono",
    toggled: false,
    type: "text"
  };
  playlistButton.rawProps = {
    iconName: "yt-sys-icons:playlist_add",
    data: playlistButtonData
  };
  libraryButton.insertAdjacentElement("afterend", playlistButton);

  document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.addEventListener("onVideoDataChange", event => {
    if (event.playertype === 1 && (event.type === "dataloaded" || event.type === "dataupdated")) {
      currentVideoId = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.getPlayerResponse().videoDetails.videoId;
    }
  });

  let rightControls = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").querySelector(".right-controls-buttons");
  let sleepTimerButton = document.createElement("yt-icon-button");

  let sleepTimerIcon = document.createElement("yt-icon");
  sleepTimerIcon.set("icon", "TIMER");
  sleepTimerButton.appendChild(sleepTimerIcon);

  sleepTimerButton.setAttribute("title", "Sleep timer off");
  sleepTimerButton.classList.add("ytmusic-player-bar");
  sleepTimerButton.classList.add("ytmd-player-bar-control");
  sleepTimerButton.classList.add("sleep-timer-button");
  sleepTimerButton.onclick = () => {
    sleepTimerButton.dispatchEvent(
      new CustomEvent("yt-action", {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: {
          actionName: "yt-open-popup-action",
          args: [
            {
              openPopupAction: {
                popup: {
                  menuPopupRenderer: {
                    accessibilityData: {
                      label: "Action menu"
                    },
                    items: [
                      {
                        menuServiceItemRenderer: {
                          icon: {
                            iconType: "CLOCK"
                          },
                          serviceEndpoint: {
                            ytmdSleepTimerServiceEndpoint: {
                              time: 5
                            }
                          },
                          text: {
                            runs: [
                              {
                                text: "5 minutes"
                              }
                            ]
                          }
                        }
                      },
                      {
                        menuServiceItemRenderer: {
                          icon: {
                            iconType: "CLOCK"
                          },
                          serviceEndpoint: {
                            ytmdSleepTimerServiceEndpoint: {
                              time: 10
                            }
                          },
                          text: {
                            runs: [
                              {
                                text: "10 minutes"
                              }
                            ]
                          }
                        }
                      },
                      {
                        menuServiceItemRenderer: {
                          icon: {
                            iconType: "CLOCK"
                          },
                          serviceEndpoint: {
                            ytmdSleepTimerServiceEndpoint: {
                              time: 15
                            }
                          },
                          text: {
                            runs: [
                              {
                                text: "15 minutes"
                              }
                            ]
                          }
                        }
                      },
                      {
                        menuServiceItemRenderer: {
                          icon: {
                            iconType: "CLOCK"
                          },
                          serviceEndpoint: {
                            ytmdSleepTimerServiceEndpoint: {
                              time: 30
                            }
                          },
                          text: {
                            runs: [
                              {
                                text: "30 minutes"
                              }
                            ]
                          }
                        }
                      },
                      {
                        menuServiceItemRenderer: {
                          icon: {
                            iconType: "CLOCK"
                          },
                          serviceEndpoint: {
                            ytmdSleepTimerServiceEndpoint: {
                              time: 45
                            }
                          },
                          text: {
                            runs: [
                              {
                                text: "45 minutes"
                              }
                            ]
                          }
                        }
                      },
                      {
                        menuServiceItemRenderer: {
                          icon: {
                            iconType: "CLOCK"
                          },
                          serviceEndpoint: {
                            ytmdSleepTimerServiceEndpoint: {
                              time: 60
                            }
                          },
                          text: {
                            runs: [
                              {
                                text: "1 hour"
                              }
                            ]
                          }
                        }
                      },
                      sleepTimerTimeout !== null
                        ? {
                          menuServiceItemRenderer: {
                            icon: {
                              iconType: "DELETE"
                            },
                            serviceEndpoint: {
                              ytmdSleepTimerServiceEndpoint: {
                                time: 0
                              }
                            },
                            text: {
                              runs: [
                                {
                                  text: "Clear sleep timer"
                                }
                              ]
                            }
                          }
                        }
                        : {}
                    ]
                  }
                },
                popupType: "DROPDOWN"
              }
            },
            sleepTimerButton
          ],
          optionalAction: false,
          returnValue: []
        }
      })
    );
  };
  rightControls.querySelector(".shuffle").insertAdjacentElement("afterend", sleepTimerButton);

  const humanizeTime = time => {
    // This is just a hacked together function to provide a humanization for the sleep timer. It serves no purpose outside that and isn't some complicated humanizer
    if (time === 1) return \`\${time} minute\`;
    if (time > 1 && time < 60) return \`\${time} minutes\`;
    if (time >= 60 && time < 120) return \`\${time / 60} hour\`;
    if (time >= 120) return \`\${time / 60} hours\`;
  };

  window.addEventListener("yt-action", e => {
    if (e.detail.actionName === "yt-service-request") {
      if (e.detail.args[1].ytmdSleepTimerServiceEndpoint) {
        if (sleepTimerTimeout !== null) {
          clearTimeout(sleepTimerTimeout);
          sleepTimerTimeout = null;
          if (sleepTimerButton.classList.contains("active")) {
            sleepTimerButton.classList.remove("active");
            sleepTimerButton.setAttribute("title", "Sleep timer off");
          }
        }

        if (e.detail.args[1].ytmdSleepTimerServiceEndpoint.time > 0) {
          if (!sleepTimerButton.classList.contains("active")) {
            sleepTimerButton.classList.add("active");
            sleepTimerButton.setAttribute("title", \`Sleep timer \${humanizeTime(e.detail.args[1].ytmdSleepTimerServiceEndpoint.time)}\`);
          }

          document.body.dispatchEvent(
            new CustomEvent("yt-action", {
              bubbles: true,
              cancelable: false,
              composed: true,
              detail: {
                actionName: "yt-open-popup-action",
                args: [
                  // Endpoint details
                  {
                    openPopupAction: {
                      popup: {
                        notificationActionRenderer: {
                          responseText: {
                            runs: [
                              {
                                text: \`Sleep timer set to \${humanizeTime(e.detail.args[1].ytmdSleepTimerServiceEndpoint.time)}\`
                              }
                            ]
                          }
                        }
                      },
                      popupType: "TOAST",
                      uniqueId: crypto.randomUUID()
                    }
                  },
                  document.querySelector("ytmusic-app")
                ],
                optionalAction: false,
                returnValue: []
              }
            })
          );

          sleepTimerTimeout = setTimeout(
            () => {
              sleepTimerTimeout = null;
              sleepTimerButton.classList.remove("active");
              sleepTimerButton.setAttribute("title", "Sleep timer off");

              if (document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playing) {
                document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.pauseVideo();

                document.body.dispatchEvent(
                  new CustomEvent("yt-action", {
                    bubbles: true,
                    cancelable: false,
                    composed: true,
                    detail: {
                      actionName: "yt-open-popup-action",
                      args: [
                        {
                          openPopupAction: {
                            popup: {
                              dismissableDialogRenderer: {
                                title: {
                                  runs: [
                                    {
                                      text: "Music paused"
                                    }
                                  ]
                                },
                                dialogMessages: [
                                  {
                                    runs: [
                                      {
                                        text: "Sleep timer expired and your music has been paused"
                                      }
                                    ]
                                  }
                                ]
                              }
                            },
                            popupType: "DIALOG"
                          }
                        },
                        document.querySelector("ytmusic-app")
                      ],
                      optionalAction: false,
                      returnValue: []
                    }
                  })
                );
              }
            },
            e.detail.args[1].ytmdSleepTimerServiceEndpoint.time * 1000 * 60
          );
        } else {
          document.body.dispatchEvent(
            new CustomEvent("yt-action", {
              bubbles: true,
              cancelable: false,
              composed: true,
              detail: {
                actionName: "yt-open-popup-action",
                args: [
                  // Endpoint details
                  {
                    openPopupAction: {
                      popup: {
                        notificationActionRenderer: {
                          responseText: {
                            runs: [
                              {
                                text: \`Sleep timer cleared\`
                              }
                            ]
                          }
                        }
                      },
                      popupType: "TOAST",
                      uniqueId: crypto.randomUUID()
                    }
                  },
                  document.querySelector("ytmusic-app")
                ],
                optionalAction: false,
                returnValue: []
              }
            })
          );
        }
      }
    }
  });

  ytmStore.subscribe(() => {
    let state = ytmStore.getState();

    // Update library button for current data
    const currentMenu = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").getMenuRenderer();
    if (currentMenu) {
      if (playlistButton.classList.contains("hidden")) {
        playlistButton.classList.remove("hidden");
      }

      let foundLibraryButton = false;
      for (let i = 0; i < currentMenu.items.length; i++) {
        const item = currentMenu.items[i];
        if (item.toggleMenuServiceItemRenderer) {
          if (
            item.toggleMenuServiceItemRenderer.defaultIcon.iconType === "BOOKMARK_BORDER" ||
            item.toggleMenuServiceItemRenderer.defaultIcon.iconType === "BOOKMARK"
          ) {
            foundLibraryButton = true;
            libraryFeedbackDefaultToken = item.toggleMenuServiceItemRenderer.defaultServiceEndpoint.feedbackEndpoint.feedbackToken;
            libraryFeedbackToggledToken = item.toggleMenuServiceItemRenderer.toggledServiceEndpoint.feedbackEndpoint.feedbackToken;

            if (
              state.toggleStates.feedbackToggleStates[libraryFeedbackDefaultToken] !== undefined &&
              state.toggleStates.feedbackToggleStates[libraryFeedbackDefaultToken] !== null
            ) {
              libraryButtonData.toggled = state.toggleStates.feedbackToggleStates[libraryFeedbackDefaultToken];
              libraryButton.setters.data(libraryButtonData); 
            } else {
              libraryButtonData.toggled = false;
              libraryButton.setters.data(libraryButtonData); 
            }

            if (item.toggleMenuServiceItemRenderer.defaultIcon.iconType === "BOOKMARK_BORDER") {
              if (libraryButtonData.toggled) {
                libraryButton.setters.iconName("yt-sys-icons:library_saved");
              } else {
                libraryButton.setters.iconName("yt-sys-icons:library_add");
              }
            } else if (item.toggleMenuServiceItemRenderer.defaultIcon.iconType === "BOOKMARK") {
              if (libraryButtonData.toggled) {
                libraryButton.setters.iconName("yt-sys-icons:library_saved");
              } else {
                libraryButton.setters.iconName("yt-sys-icons:library_add");
              }
            }
            break;
          }
        }
      }

      if (!foundLibraryButton) {
        if (!libraryButton.classList.contains("hidden")) {
          libraryButton.classList.add("hidden");
        }
      } else {
        if (libraryButton.classList.contains("hidden")) {
          libraryButton.classList.remove("hidden");
        }
      }
    } else {
      if (!libraryButton.classList.contains("hidden")) {
        libraryButton.classList.add("hidden");
      }
      if (!playlistButton.classList.contains("hidden")) {
        playlistButton.classList.add("hidden");
      }
    }
  });

  ytmdControlButtons.libraryButton = libraryButton;
});
`,b=`(function() {
  const ytmStore = window.__YTMD_HOOK__.ytmStore;

  function sendStoreState() {
    // We don't want to see everything in the store as there can be some sensitive data so we only send what's necessary to operate
    let state = ytmStore.getState();

    const videoId = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.getPlayerResponse()?.videoDetails?.videoId;
    const likeButtonData = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").querySelector("ytmusic-like-button-renderer").data;
    const defaultLikeStatus = likeButtonData?.likeStatus ?? "UNKNOWN";
    const storeLikeStatus = state.likeStatus.videos[videoId];
    
    const likeStatus = storeLikeStatus ? state.likeStatus.videos[videoId] : defaultLikeStatus;
    const volume = state.player.volume;
    const adPlaying = state.player.adPlaying;
    const muted = state.player.muted;

    window.ytmd.sendStoreUpdate(state.queue, likeStatus, volume, muted, adPlaying);
  }

  document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.addEventListener("onVideoProgress", progress => {
    window.ytmd.sendVideoProgress(progress);
  });
  document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.addEventListener("onStateChange", state => {
    window.ytmd.sendVideoState(state);
  });
  document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.addEventListener("onVideoDataChange", event => {
    if (event.playertype === 1 && (event.type === "dataloaded" || event.type === "dataupdated")) {
      let videoDetails = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.getPlayerResponse().videoDetails;
      let playlistId = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.getPlaylistId();
      let album = null;
      let hasFullMetadata = false;

      // If playing from online sources this usually is filled out with the first dataupdated which is followed after dataloaded. While offline this is always filled
      let currentItem = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").currentItem;
      if (currentItem !== null && currentItem !== undefined) {
        hasFullMetadata = true;

        // Fill out video details with better information
        videoDetails.title = currentItem.title.runs.map(v => v.text).join(""); // Can contain featuring text which isn't in player response
        videoDetails.thumbnail = currentItem.thumbnail; // Can contain more thumbnails than player response

        for (let i = 0; i < currentItem.longBylineText.runs.length; i++) {
          const item = currentItem.longBylineText.runs[i];
          if (item.navigationEndpoint) {
            if (item.navigationEndpoint.browseEndpoint.browseEndpointContextSupportedConfigs.browseEndpointContextMusicConfig.pageType === "MUSIC_PAGE_TYPE_ALBUM") {
              album = {
                id: item.navigationEndpoint.browseEndpoint.browseId,
                text: item.text
              }
            }
          }
        }
      }

      let state = ytmStore.getState();
      const likeButtonData = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").querySelector("ytmusic-like-button-renderer").data;
      const defaultLikeStatus = likeButtonData?.likeStatus ?? "UNKNOWN";
      const storeLikeStatus = state.likeStatus.videos[videoDetails.videoId];
      
      const likeStatus = storeLikeStatus ? state.likeStatus.videos[videoDetails.videoId] : defaultLikeStatus;

      window.ytmd.sendVideoData(videoDetails, playlistId, album, likeStatus, hasFullMetadata);
    }
  });
  ytmStore.subscribe(() => {
    sendStoreState();
  });
  window.addEventListener("yt-action", e => {
    if (e.detail.actionName === "yt-service-request") {
      if (e.detail.args[1].createPlaylistServiceEndpoint) {
        let title = e.detail.args[2].create_playlist_title;
        let returnValue = e.detail.returnValue;
        returnValue[0].ajaxPromise.then(response => {
          let id = response.data.playlistId;
          window.ytmd.sendCreatePlaylistObservation({
            title,
            id
          });
        });
      }
    } else if (e.detail.actionName === "yt-handle-playlist-deletion-command") {
      let playlistId = e.detail.args[0].handlePlaylistDeletionCommand.playlistId;
      window.ytmd.sendDeletePlaylistObservation(playlistId);
    }
  });
})
`,v=`(function() {
  return new Promise((resolve, reject) => {
    var returnValue = [];
    var serviceRequestEvent = {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: {
        actionName: "yt-service-request",
        args: [
          document.querySelector("ytmusic-app-layout>ytmusic-player-bar"),
          {
            addToPlaylistEndpoint: {
              videoId: document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.getPlayerResponse().videoDetails.videoId
            }
          }
        ],
        optionalAction: false,
        returnValue
      }
    };
    document.querySelector("ytmusic-app-layout>ytmusic-player-bar").dispatchEvent(new CustomEvent("yt-action", serviceRequestEvent));
    returnValue[0].ajaxPromise.then(
      response => {
        resolve(response.data.contents[0].addToPlaylistRenderer.playlists);
      },
      () => {
        reject();
      }
    );
  });
})
`,f=`(function() {
  const ytmStore = window.__YTMD_HOOK__.ytmStore;

  const videoId = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.getPlayerResponse().videoDetails.videoId;
  const likeButtonData = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").querySelector("ytmusic-like-button-renderer").data;
  
  let likeServiceEndpoint = null;
  let indifferentServiceEndpoint = null;

  for (const endpoint of likeButtonData.serviceEndpoints) {
    if (endpoint.likeEndpoint.status === "LIKE") {
      likeServiceEndpoint = endpoint;
    } else if (endpoint.likeEndpoint.status === "INDIFFERENT") {
      indifferentServiceEndpoint = endpoint;
    }
  }

  let serviceEvent = null;

  const defaultLikeStatus = likeButtonData.likeStatus;
  const state = ytmStore.getState();
  const storeLikeStatus = state.likeStatus.videos[videoId];

  const likeStatus = storeLikeStatus ? state.likeStatus.videos[videoId] : defaultLikeStatus;

  if (likeStatus === "LIKE") {
    serviceEvent = {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: {
        actionName: "yt-service-request",
        args: [
          document.querySelector("ytmusic-like-button-renderer"),
          indifferentServiceEndpoint
        ],
        optionalAction: false,
        returnValue: []
      }
    };
  } else if (likeStatus === "DISLIKE" || likeStatus === "INDIFFERENT") {
    serviceEvent = {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: {
        actionName: "yt-service-request",
        args: [
          document.querySelector("ytmusic-like-button-renderer"),
          likeServiceEndpoint
        ],
        optionalAction: false,
        returnValue: []
      }
    };
  }

  if (serviceEvent) document.querySelector("ytmusic-like-button-renderer").dispatchEvent(new CustomEvent("yt-action", serviceEvent));
})
`,g=`(function() {
  const ytmStore = window.__YTMD_HOOK__.ytmStore;

  const videoId = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.getPlayerResponse().videoDetails.videoId;
  const likeButtonData = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").querySelector("ytmusic-like-button-renderer").data;
  
  let dislikeServiceEndpoint = null;
  let indifferentServiceEndpoint = null;

  for (const endpoint of likeButtonData.serviceEndpoints) {
    if (endpoint.likeEndpoint.status === "DISLIKE") {
      dislikeServiceEndpoint = endpoint;
    } else if (endpoint.likeEndpoint.status === "INDIFFERENT") {
      indifferentServiceEndpoint = endpoint;
    }
  }

  let serviceEvent = null;

  const defaultLikeStatus = likeButtonData.likeStatus;
  const state = ytmStore.getState();
  const storeLikeStatus = state.likeStatus.videos[videoId];

  const likeStatus = storeLikeStatus ? state.likeStatus.videos[videoId] : defaultLikeStatus;

  if (likeStatus === "DISLIKE") {
    serviceEvent = {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: {
        actionName: "yt-service-request",
        args: [
          document.querySelector("ytmusic-like-button-renderer"),
          indifferentServiceEndpoint
        ],
        optionalAction: false,
        returnValue: []
      }
    };
  } else if (likeStatus === "LIKE" || likeStatus === "INDIFFERENT") {
    serviceEvent = {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: {
        actionName: "yt-service-request",
        args: [
          document.querySelector("ytmusic-like-button-renderer"),
          dislikeServiceEndpoint
        ],
        optionalAction: false,
        returnValue: []
      }
    };
  }

  if (serviceEvent) document.querySelector("ytmusic-like-button-renderer").dispatchEvent(new CustomEvent("yt-action", serviceEvent));
})
`,u=new m;e.contextBridge.exposeInMainWorld("ytmd",{sendVideoProgress:t=>e.ipcRenderer.send("ytmView:videoProgressChanged",t),sendVideoState:t=>e.ipcRenderer.send("ytmView:videoStateChanged",t),sendVideoData:(t,n,r,s,d)=>e.ipcRenderer.send("ytmView:videoDataChanged",t,n,r,s,d),sendStoreUpdate:(t,n,r,s,d)=>e.ipcRenderer.send("ytmView:storeStateChanged",t,n,r,s,d),sendCreatePlaylistObservation:t=>e.ipcRenderer.send("ytmView:createPlaylistObserved",t),sendDeletePlaylistObservation:t=>e.ipcRenderer.send("ytmView:deletePlaylistObserved",t),audioEffects:{setEnabled:t=>e.ipcRenderer.send("audioEffects:setEnabled",t),updateParams:t=>e.ipcRenderer.send("audioEffects:updateParams",t),getParams:()=>e.ipcRenderer.invoke("audioEffects:getParams")}});function S(){const t=document.createElement("style");t.appendChild(document.createTextNode(`
      .ytmd-history-back, .ytmd-history-forward {
        cursor: pointer;
        margin: 0 18px 0 2px;
        font-size: 24px;
        color: rgba(255, 255, 255, 0.5);
      }

      .ytmd-history-back.pivotbar, .ytmd-history-forward.pivotbar {
        padding-top: 12px;
      }

      .ytmd-history-back.disabled, .ytmd-history-forward.disabled {
        cursor: not-allowed;
      }

      .ytmd-history-back:hover:not(.disabled), .ytmd-history-forward:hover:not(.disabled) {
        color: #FFFFFF;
      }

      .ytmd-hidden {
        display: none;
      }

      .ytmd-persist-volume-slider {
        opacity: 1 !important;
        pointer-events: initial !important;
      }
      
      .ytmd-player-bar-control.library-button {
        margin-left: 8px;
      }

      .ytmd-player-bar-control.library-button.hidden {
        display: none;
      }

      .ytmd-player-bar-control.playlist-button {
        margin-left: 8px;
      }

      .ytmd-player-bar-control.playlist-button.hidden {
        display: none;
      }

      .ytmd-player-bar-control.sleep-timer-button.active {
        color: #FFFFFF;
      }
    `)),document.head.appendChild(t)}function h(){const t=document.createElement("link");return t.rel="stylesheet",t.href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,100,0,0",t}function w(){const t=document.createElement("span");t.classList.add("material-symbols-outlined","ytmd-history-back","disabled"),t.innerText="west",t.addEventListener("click",function(){t.classList.contains("disabled")||history.back()});const n=document.createElement("span");n.classList.add("material-symbols-outlined","ytmd-history-forward","disabled"),n.innerText="east",n.addEventListener("click",function(){n.classList.contains("disabled")||history.forward()}),e.ipcRenderer.on("ytmView:navigationStateChanged",(s,d)=>{d.canGoBack?t.classList.remove("disabled"):t.classList.add("disabled"),d.canGoForward?n.classList.remove("disabled"):n.classList.add("disabled")});const r=document.querySelector("ytmusic-pivot-bar-renderer");if(r)n.classList.add("pivotbar"),t.classList.add("pivotbar"),r.prepend(n),r.prepend(t);else{const s=document.querySelector("ytmusic-search-box"),d=s.parentNode;d.insertBefore(n,s),d.insertBefore(t,n)}}function E(){const t=document.createElement("div");t.tabIndex=32767,t.onfocus=()=>{t.blur(),e.ipcRenderer.send("ytmView:switchFocus","main")},document.body.appendChild(t)}async function x(){(await e.webFrame.executeJavaScript(y))()}async function k(){(await e.webFrame.executeJavaScript(`
      (function() {
        window.__YTMD_HOOK__.ytmStore.dispatch({ type: 'SET_CAST_AVAILABLE', payload: false });
      })
    `))()}async function _(){(await e.webFrame.executeJavaScript(b))()}function T(){document.querySelector("#history-link .history-button").style="display: inline-block !important;"}function I(t){let n="";for(const r of t)n+=r.text;return n}(async function(){(await e.webFrame.executeJavaScript(`
    (function() {
      let fakeBaseClass = function() {
        try {
          if (!window.__YTMD_HOOK__) {
            if (this.store && !!this.store.getState && !!this.store.dispatch && !!this.store.subscribe) {
              let ytmdHook = {
                ytmStore: this.store
              };
              Object.freeze(ytmdHook);
              window.__YTMD_HOOK__ = ytmdHook;
            }
          }
        } catch {}
      }
      Object.defineProperty(window, "PolymerFakeBaseClassWithoutHtml", {
        set: (value) => {},
        get: () => {
          return fakeBaseClass
        }
      })
    })
  `))()})();window.addEventListener("load",async()=>{if(window.location.hostname!=="music.youtube.com"){(window.location.hostname==="consent.youtube.com"||window.location.hostname==="accounts.google.com")&&e.ipcRenderer.send("ytmView:loaded");return}await new Promise(l=>{const i=setInterval(async()=>{(await e.webFrame.executeJavaScript(`
        (function() {
          if (window.__YTMD_HOOK__) {
            return true;
          }
          
          return false;
        })
      `))()&&(clearInterval(i),l())},250)});let t=!1;const n=h();n.onload=()=>{t=!0},document.head.appendChild(n),await new Promise(l=>{const i=setInterval(async()=>{const o=(await e.webFrame.executeJavaScript(`
          (function() {
            return document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.isReady();
          })
        `))();t&&o&&(clearInterval(i),l())},250)}),S(),w(),E(),await x(),await k(),await _(),T();/* Lightweight mode by l'abdouszlai */try{var dha=await u.get("general.disableHardwareAcceleration");if(dha){var ds=document.createElement("style");ds.textContent="ytmusic-player video{display:none!important}";document.head.appendChild(ds);await e.webFrame.executeJavaScript("(function(){var A='__ytmd_art__',E=null;function T(){try{var b=document.querySelector('ytmusic-player-bar');if(!b)return null;if(b.currentItem&&b.currentItem.thumbnail&&b.currentItem.thumbnail.thumbnails)return b.currentItem.thumbnail.thumbnails.slice(-1)[0].url;if(b.playerApi){var r=b.playerApi.getPlayerResponse();if(r&&r.videoDetails&&r.videoDetails.thumbnail&&r.videoDetails.thumbnail.thumbnails)return r.videoDetails.thumbnail.thumbnails.slice(-1)[0].url}return null}catch(e){return null}}function S(u){if(!u)return;var p=document.querySelector('ytmusic-player');if(!p||!p.shadowRoot)return;if(!E){E=p.shadowRoot.getElementById(A);if(!E){E=document.createElement('div');E.id=A;E.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;background-size:contain;background-position:center;background-repeat:no-repeat;background-color:#000;z-index:0;pointer-events:none';p.shadowRoot.insertBefore(E,p.shadowRoot.firstChild)}}E.style.backgroundImage='url('+u+')'}S(T());try{var L='',H=window.__YTMD_HOOK__;if(H&&H.ytmStore)H.ytmStore.subscribe(function(){try{var s=H.ytmStore.getState(),q=s.queue;if(q&&q.items&&q.items.length>0){var i=q.index||0,it=q.items[i];if(it&&it.thumbnail&&it.thumbnail.thumbnails){var u=it.thumbnail.thumbnails.slice(-1)[0].url;if(u!==L){L=u;S(u)}}}}catch(e){}})}catch(e){}setInterval(function(){S(T())},3e4)})()")}}catch{}try{await e.webFrame.executeJavaScript(`
      (function() {
        console.log("[ytmd-ae] Injecting audio effects button...");
        var btn = document.createElement("yt-icon-button");
        btn.id = "ytmd-ae-btn";
        btn.title = "Audio Effects";
        var rIcon = document.createElement("yt-icon");
        rIcon.set("icon", "SETTINGS");
        btn.appendChild(rIcon);
        btn.classList.add("ytmusic-player-bar");
        btn.classList.add("ytmd-player-bar-control");
        btn.onclick = function() {
          var pop = document.getElementById("__ytmd_ae_pop");
          if (pop) { pop.remove(); return; }

          var vals = { speed: 1, reverb: 0, bassBoost: 0, preservePitch: true };
          var video = document.querySelector("video");
          if (video) vals.speed = parseFloat(video.playbackRate) || 1;

          var oldAE = window.__ytmd_audio_effects;
          if (oldAE && oldAE._getParams) {
            var p = oldAE._getParams();
            vals.speed = p.speed;
            vals.reverb = p.reverb;
            vals.bassBoost = p.bassBoost;
            vals.preservePitch = p.preservePitch;
          }

          function syncUI() {
            var e = function(id) { return document.getElementById(id); };
            if (e("ae_s")) e("ae_s").value = vals.speed;
            if (e("ae_sv")) e("ae_sv").textContent = vals.speed.toFixed(2)+"x";
            if (e("ae_r")) e("ae_r").value = vals.reverb;
            if (e("ae_rv")) e("ae_rv").textContent = vals.reverb+"%";
            if (e("ae_b")) e("ae_b").value = vals.bassBoost;
            if (e("ae_bv")) e("ae_bv").textContent = vals.bassBoost+" dB";
            if (e("ae_pp")) e("ae_pp").checked = vals.preservePitch;
          }

          function buildIR(ctx, dur) {
            var sr = ctx.sampleRate, len = Math.floor(sr * dur);
            var buf = ctx.createBuffer(2, len, sr);
            for (var ch = 0; ch < 2; ch++) {
              var d = buf.getChannelData(ch);
              for (var i = 0; i < len; i++) {
                var n = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
                d[i] = n * (1 - 0.3 * (i / len));
              }
            }
            return buf;
          }

          function ensureAE() {
            var v = document.querySelector("video");
            if (!v) return null;
            var ae = window.__ytmd_audio_effects;
            if (ae && ae._videoEl === v) return ae;
            if (ae) try { ae.ctx.close(); } catch(e) {}
            ae = null;
            try {
              var ctx = new (window.AudioContext || window.webkitAudioContext)();
              if (ctx.state === "suspended") ctx.resume();
              var src = ctx.createMediaElementSource(v);
              var pre = ctx.createGain();
              var dry = ctx.createGain();
              var wet = ctx.createGain();
              var conv = ctx.createConvolver();
              var bass = ctx.createBiquadFilter();
              bass.type = "lowshelf";
              bass.frequency.value = 100;
              conv.buffer = buildIR(ctx, 2);
              src.connect(bass);
              bass.connect(dry);
              bass.connect(conv);
              conv.connect(wet);
              dry.connect(ctx.destination);
              wet.connect(ctx.destination);
              dry.gain.value = 1;
              wet.gain.value = 0;
              bass.gain.value = 0;
              ae = {
                _videoEl: v, ctx: ctx, pre: pre, dry: dry, wet: wet, conv: conv, bass: bass,
                _params: { speed: vals.speed, reverb: vals.reverb, bassBoost: vals.bassBoost, preservePitch: vals.preservePitch },
                _getParams: function() { return { speed: this._params.speed, reverb: this._params.reverb, bassBoost: this._params.bassBoost, preservePitch: this._params.preservePitch }; }
              };
              ae._update = function(np) {
                var p = this._params;
                for (var k in np) p[k] = np[k];
                if (video) { video.playbackRate = p.speed; video.preservesPitch = p.preservePitch; }
                var w = p.reverb / 200;
                dry.gain.value = 1 - w;
                wet.gain.value = w;
                bass.gain.value = p.bassBoost;
              };
              ae._update(vals);
              window.__ytmd_audio_effects = ae;
            } catch (e) { console.error("[ytmd-ae] Audio setup failed:", e); }
            return ae;
          }

          function apply() {
            if (video) { video.playbackRate = vals.speed; video.preservesPitch = vals.preservePitch; }
            var ae = ensureAE();
            if (ae) {
              if (ae.ctx.state === "suspended") ae.ctx.resume();
              ae._update(vals);
            }
          }

          function resetAll() {
            vals = { speed: 1, reverb: 0, bassBoost: 0, preservePitch: true };
            if (video) { video.playbackRate = 1; video.preservesPitch = true; }
            syncUI();
            var ae = window.__ytmd_audio_effects;
            if (ae) ae._update(vals);
          }

          pop = document.createElement("div");
          pop.id = "__ytmd_ae_pop";

          var bd = document.createElement("div");
          bd.className = "ae-bd";
          pop.appendChild(bd);

          var bx = document.createElement("div");
          bx.className = "ae-bx";
          pop.appendChild(bx);

          var hd = document.createElement("div");
          hd.className = "ae-hd";
          var htitle = document.createElement("span");
          htitle.style.cssText = "font-weight:600;font-size:15px";
          htitle.textContent = "Slowed Reverb";
          hd.appendChild(htitle);
          var xbtn = document.createElement("button");
          xbtn.className = "ae-x";
          xbtn.style.cssText = "margin-left:auto;background:none;border:none;color:#888;cursor:pointer;padding:2px 6px;border-radius:4px;font-size:18px";
          xbtn.textContent = "\u00D7";
          hd.appendChild(xbtn);
          bx.appendChild(hd);

          var bd2 = document.createElement("div");
          bd2.className = "ae-bd2";
          bx.appendChild(bd2);

          function mkSliderRow(label, id, valId, min, max, step, minL, maxL) {
            var rw = document.createElement("div");
            rw.className = "ae-rw";
            var d = document.createElement("div");
            d.style.cssText = "display:flex;justify-content:space-between;font-size:13px;margin-bottom:2px";
            var lb = document.createElement("span");
            lb.textContent = label;
            d.appendChild(lb);
            var vl = document.createElement("span");
            vl.className = "ae-vl";
            vl.id = valId;
            vl.style.cssText = "color:#1e88e5;font-weight:600";
            d.appendChild(vl);
            rw.appendChild(d);
            var inp = document.createElement("input");
            inp.type = "range";
            inp.id = id;
            inp.min = min;
            inp.max = max;
            inp.step = step;
            inp.style.cssText = "-webkit-appearance:none";
            rw.appendChild(inp);
            var rg = document.createElement("div");
            rg.className = "ae-rg";
            var mn = document.createElement("span");
            mn.textContent = minL;
            rg.appendChild(mn);
            var mx = document.createElement("span");
            mx.textContent = maxL;
            rg.appendChild(mx);
            rw.appendChild(rg);
            return rw;
          }

          function mkCb(id, label) {
            var lb = document.createElement("label");
            lb.className = "ae-cb";
            lb.style.cssText = "display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer";
            var inp = document.createElement("input");
            inp.type = "checkbox";
            inp.id = id;
            inp.style.cssText = "width:16px;height:16px;accent-color:#1e88e5;cursor:pointer";
            lb.appendChild(inp);
            var txt = document.createElement("span");
            txt.textContent = label;
            lb.appendChild(txt);
            return lb;
          }

          bd2.appendChild(mkSliderRow("Speed", "ae_s", "ae_sv", "0.25", "2", "0.05", "0.25x", "2.0x"));
          bd2.appendChild(mkSliderRow("Reverb", "ae_r", "ae_rv", "0", "200", "1", "0%", "200%"));
          bd2.appendChild(mkSliderRow("Bass Boost", "ae_b", "ae_bv", "0", "20", "0.5", "0 dB", "20 dB"));
          bd2.appendChild(mkCb("ae_pp", "Preserve Pitch"));

          var btnRow = document.createElement("div");
          btnRow.style.cssText = "display:flex;gap:8px;margin-top:4px";

          var ab = document.createElement("button");
          ab.textContent = "Apply";
          ab.style.cssText = "flex:1;padding:8px 0;background:#1e88e5;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer";
          btnRow.appendChild(ab);

          var rb = document.createElement("button");
          rb.textContent = "Off";
          rb.style.cssText = "flex:0 0 52px;padding:8px 0;background:#555;color:#ccc;border:none;border-radius:6px;font-size:13px;cursor:pointer";
          btnRow.appendChild(rb);

          bd2.appendChild(btnRow);

          document.body.appendChild(pop);

          var st = document.createElement("style");
          st.textContent =
            '#__ytmd_ae_pop .ae-bd{position:fixed;inset:0;background:rgba(0,0,0,0.35);z-index:9999}' +
            '#__ytmd_ae_pop .ae-bx{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(26,26,26,0.85);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);border-radius:12px;width:320px;color:#e0e0e0;font-family:"Roboto",sans-serif;box-shadow:0 8px 32px rgba(0,0,0,0.5);z-index:10000}' +
            '#__ytmd_ae_pop .ae-hd{display:flex;align-items:center;gap:8px;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.08)}' +
            '#__ytmd_ae_pop .ae-bd2{padding:14px 18px 18px;display:flex;flex-direction:column;gap:14px}' +
            '#__ytmd_ae_pop .ae-rw{opacity:1;pointer-events:auto}' +
            '#__ytmd_ae_pop .ae-rw input[type="range"]{width:100%;height:4px;-webkit-appearance:none;background:rgba(255,255,255,0.15);border-radius:2px;outline:none;cursor:pointer}' +
            '#__ytmd_ae_pop .ae-rw input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;background:#1e88e5;border-radius:50%;cursor:pointer;border:2px solid #1565c0}' +
            '#__ytmd_ae_pop .ae-rg{display:flex;justify-content:space-between;font-size:11px;color:#777;margin-top:1px}';
          document.head.appendChild(st);

          syncUI();

          xbtn.onclick = function(){ pop.remove(); };
          bd.onclick = function(){ pop.remove(); };

          document.getElementById("ae_s").oninput = function() {
            vals.speed = parseFloat(this.value);
            document.getElementById("ae_sv").textContent = vals.speed.toFixed(2)+"x";
            if (video) video.playbackRate = vals.speed;
          };
          document.getElementById("ae_r").oninput = function() {
            vals.reverb = parseInt(this.value);
            document.getElementById("ae_rv").textContent = vals.reverb+"%";
          };
          document.getElementById("ae_b").oninput = function() {
            vals.bassBoost = parseFloat(this.value);
            document.getElementById("ae_bv").textContent = vals.bassBoost+" dB";
          };
          document.getElementById("ae_pp").onchange = function() {
            vals.preservePitch = this.checked;
          };
          ab.onclick = apply;
          rb.onclick = resetAll;
        };

        window.__ytmd_ae_syncPopup = function(p) {
          var e = function(id) { return document.getElementById(id); };
          if (e("ae_s")) e("ae_s").value = p.speed;
          if (e("ae_sv")) e("ae_sv").textContent = p.speed.toFixed(2)+"x";
          if (e("ae_r")) e("ae_r").value = p.reverb;
          if (e("ae_rv")) e("ae_rv").textContent = p.reverb+"%";
          if (e("ae_b")) e("ae_b").value = p.bassBoost;
          if (e("ae_bv")) e("ae_bv").textContent = p.bassBoost+" dB";
          if (e("ae_pp")) e("ae_pp").checked = p.preservePitch;
        };

        window.__ytmd_ae_shortcut = function(action) {
          var v = document.querySelector("video");
          if (!v) return;
          var ae = window.__ytmd_audio_effects;
          if (!ae) { window.__ytmd_ae_params = window.__ytmd_ae_params || {speed:1,reverb:0,bassBoost:0,preservePitch:true}; }
          var p = ae ? ae._params : window.__ytmd_ae_params;
          switch (action) {
            case "speedUp": p.speed = Math.min(2, +(p.speed + 0.1).toFixed(2)); v.playbackRate = p.speed; break;
            case "speedDown": p.speed = Math.max(0.25, +(p.speed - 0.1).toFixed(2)); v.playbackRate = p.speed; break;
            case "reverbUp": p.reverb = Math.min(200, p.reverb + 10); break;
            case "reverbDown": p.reverb = Math.max(0, p.reverb - 10); break;
            case "bassUp": p.bassBoost = Math.min(20, +(p.bassBoost + 1).toFixed(1)); break;
            case "bassDown": p.bassBoost = Math.max(0, +(p.bassBoost - 1).toFixed(1)); break;
            case "apply": break; // handled below
            case "off": p.speed = 1; p.reverb = 0; p.bassBoost = 0; p.preservePitch = true; v.playbackRate = 1; v.preservesPitch = true; break;
            case "togglePreservePitch": p.preservePitch = !p.preservePitch; v.preservesPitch = p.preservePitch; break;
          }
          if (ae) ae._update(p);
          else if (action === "apply" || action === "off") {
            // Create AudioContext and apply
            ae = window.__ytmd_audio_effects;
            if (!ae) {
              try {
                var ctx = new (window.AudioContext || window.webkitAudioContext)();
                if (ctx.state === "suspended") ctx.resume();
                var src = ctx.createMediaElementSource(v);
                var dry = ctx.createGain();
                var wet = ctx.createGain();
                var conv = ctx.createConvolver();
                var bass = ctx.createBiquadFilter();
                bass.type = "lowshelf"; bass.frequency.value = 100;
                var sr = ctx.sampleRate, len = Math.floor(sr * 2);
                var buf = ctx.createBuffer(2, len, sr);
                for (var ch = 0; ch < 2; ch++) {
                  var d = buf.getChannelData(ch);
                  for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3) * (1 - 0.3 * (i / len));
                }
                conv.buffer = buf;
                src.connect(bass); bass.connect(dry); bass.connect(conv); conv.connect(wet); dry.connect(ctx.destination); wet.connect(ctx.destination);
                dry.gain.value = 1; wet.gain.value = 0; bass.gain.value = 0;
                ae = { _videoEl: v, ctx: ctx, dry: dry, wet: wet, conv: conv, bass: bass, _params: p,
                  _update: function(np) { var pp = this._params; for (var k in np) pp[k] = np[k];
                    if (v) { v.playbackRate = pp.speed; v.preservesPitch = pp.preservePitch; }
                    var w = pp.reverb / 200; this.dry.gain.value = 1 - w; this.wet.gain.value = w; this.bass.gain.value = pp.bassBoost;
                  }
                };
                ae._update(p);
                window.__ytmd_audio_effects = ae;
              } catch (e) { console.error("[ytmd-ae] Shortcut setup failed:", e); }
            }
            if (ae) { if (ae.ctx && ae.ctx.state === "suspended") ae.ctx.resume(); ae._update(p); }
          }
          window.__ytmd_ae_syncPopup(p);
        };

        var target = document.querySelector("ytmusic-app-layout>ytmusic-player-bar .right-controls-buttons");
        if (target) {
          var ref = target.querySelector(".shuffle");
          if (ref) {
            ref.insertAdjacentElement("afterend", btn);
          } else {
            target.appendChild(btn);
          }
        } else {
          var bar = document.querySelector("ytmusic-app-layout>ytmusic-player-bar");
          if (bar) {
            bar.appendChild(btn);
          } else {
            document.body.appendChild(btn);
          }
        }
        return "done";
      })()
    `)}catch(l){console.error("[ytmd-ae] Error:",l)}const r=await e.ipcRenderer.invoke("ytmView:getIntegrationScripts");const s=await u.get("state");if((await u.get("playback")).continueWhereYouLeftOff){if(s.lastUrl.startsWith("https://music.youtube.com/watch"))(await e.webFrame.executeJavaScript(`
          (function() {
            window.ytmd.sendVideoData(document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.getPlayerResponse().videoDetails, document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.getPlaylistId());
          })
        `))();else if(s.lastVideoId){let l=0;const i=async o=>{o.target===document.querySelector("ytmusic-app-layout>ytmusic-player-bar")&&o.propertyName==="height"&&((await e.webFrame.executeJavaScript(`
                  (function() {
                    document.querySelector("ytmusic-popup-container").refitPopups_();
                  })
                `))(),l++,l>=2&&document.querySelector("ytmusic-app-layout>ytmusic-player-bar").removeEventListener("transitionend",i))};document.querySelector("ytmusic-app-layout>ytmusic-player-bar").addEventListener("transitionend",i),document.dispatchEvent(new CustomEvent("yt-navigate",{detail:{endpoint:{watchEndpoint:{videoId:s.lastVideoId,playlistId:s.lastPlaylistId}}}}))}}(await u.get("appearance")).alwaysShowVolumeSlider&&document.querySelector("ytmusic-app-layout>ytmusic-player-bar #volume-slider").classList.add("ytmd-persist-volume-slider"),e.ipcRenderer.on("remoteControl:execute",async(l,i,o)=>{switch(i){case"playPause":{(await e.webFrame.executeJavaScript(`
            (function() {
              document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playing ? document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.pauseVideo() : document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.playVideo();
            })
          `))();break}case"play":{(await e.webFrame.executeJavaScript(`
            (function() {
              document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.playVideo();
            })
          `))();break}case"pause":{(await e.webFrame.executeJavaScript(`
            (function() {
              document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.pauseVideo();
            })
          `))();break}case"next":{(await e.webFrame.executeJavaScript(`
            (function() {
              document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.nextVideo();
            })
          `))();break}case"previous":{(await e.webFrame.executeJavaScript(`
            (function() {
              document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.previousVideo();
            })
          `))();break}case"toggleLike":{(await e.webFrame.executeJavaScript(f))();break}case"toggleDislike":{(await e.webFrame.executeJavaScript(g))();break}case"volumeUp":{const a=(await e.webFrame.executeJavaScript(`
            (function() {
              return document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.getVolume();
            })
          `))();let c=a+10;a>100&&(c=100),(await e.webFrame.executeJavaScript(`
            (function(newVolumeUp) {
              document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.setVolume(newVolumeUp);
              window.__YTMD_HOOK__.ytmStore.dispatch({ type: 'SET_VOLUME', payload: newVolumeUp });
            })
          `))(c);break}case"volumeDown":{const a=(await e.webFrame.executeJavaScript(`
            (function() {
              return document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.getVolume();
            })
          `))();let c=a-10;a<0&&(c=0),(await e.webFrame.executeJavaScript(`
            (function(newVolumeDown) {
              document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.setVolume(newVolumeDown);
              window.__YTMD_HOOK__.ytmStore.dispatch({ type: 'SET_VOLUME', payload: newVolumeDown });
            })
          `))(c);break}case"setVolume":{const a=parseInt(o);if(isNaN(a)||a<0||a>100)return;(await e.webFrame.executeJavaScript(`
            (function(valueInt) {
              document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.setVolume(valueInt);
              window.__YTMD_HOOK__.ytmStore.dispatch({ type: 'SET_VOLUME', payload: valueInt });
            })
          `))(a);break}case"mute":(await e.webFrame.executeJavaScript(`
            (function() {
              document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.mute();
              window.__YTMD_HOOK__.ytmStore.dispatch({ type: 'SET_MUTED', payload: true });
            })
          `))();break;case"unmute":(await e.webFrame.executeJavaScript(`
            (function() {
              document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.unMute();
              window.__YTMD_HOOK__.ytmStore.dispatch({ type: 'SET_MUTED', payload: false });
            })
          `))();break;case"repeatMode":(await e.webFrame.executeJavaScript(`
            (function(value) {
              window.__YTMD_HOOK__.ytmStore.dispatch({ type: 'SET_REPEAT', payload: value });
            })
          `))(o);break;case"seekTo":(await e.webFrame.executeJavaScript(`
            (function(value) {
              document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.seekTo(value);
            })
          `))(o);break;case"shuffle":(await e.webFrame.executeJavaScript(`
            (function() {
              document.querySelector("ytmusic-app-layout>ytmusic-player-bar").queue.shuffle();
            })
          `))();break;case"playQueueIndex":{const a=parseInt(o);(await e.webFrame.executeJavaScript(`
            (function(index) {
              const state = window.__YTMD_HOOK__.ytmStore.getState();
              const queue = state.queue;

              const maxQueueIndex = state.queue.items.length - 1;
              const maxAutoMixQueueIndex = Math.max(state.queue.automixItems.length - 1, 0);

              let useAutoMix = false;
              if (index > maxQueueIndex) {
                index = index - state.queue.items.length;
                useAutoMix = true;
              }

              let song = null;
              if (!useAutoMix) {
                song = queue.items[index];
              } else {
                song = queue.automixItems[index];
              }

              let playlistPanelVideoRenderer;
              if (song.playlistPanelVideoRenderer) {
                playlistPanelVideoRenderer = song.playlistPanelVideoRenderer;
              } else if (song.playlistPanelVideoWrapperRenderer) {
                playlistPanelVideoRenderer = song.playlistPanelVideoWrapperRenderer.primaryRenderer.playlistPanelVideoRenderer;
              }

              document.dispatchEvent(
                new CustomEvent("yt-navigate", {
                  detail: {
                    endpoint: {
                      watchEndpoint: playlistPanelVideoRenderer.navigationEndpoint.watchEndpoint
                    }
                  }
                })
              );
            })
          `))(a);break}case"audioEffects:speedUp":case"audioEffects:speedDown":case"audioEffects:reverbUp":case"audioEffects:reverbDown":case"audioEffects:bassUp":case"audioEffects:bassDown":case"audioEffects:apply":case"audioEffects:off":case"audioEffects:togglePreservePitch":{const a=i.split(":")[1];await e.webFrame.executeJavaScript(`window.__ytmd_ae_shortcut("${a}")`);break}case"navigate":{const a=o;document.dispatchEvent(new CustomEvent("yt-navigate",{detail:{endpoint:a}}));break}}}),e.ipcRenderer.on("ytmView:getPlaylists",async(l,i)=>{const o=await(await e.webFrame.executeJavaScript(v))(),a=[];for(const c of o){const p=c.playlistAddToOptionRenderer;a.push({id:p.playlistId,title:I(p.title.runs)})}e.ipcRenderer.send(`ytmView:getPlaylists:response:${i}`,a)}),u.onDidAnyChange(l=>{if(l.appearance.alwaysShowVolumeSlider){const i=document.querySelector("#volume-slider");i.classList.contains("ytmd-persist-volume-slider")||i.classList.add("ytmd-persist-volume-slider")}else{const i=document.querySelector("#volume-slider");i.classList.contains("ytmd-persist-volume-slider")&&i.classList.remove("ytmd-persist-volume-slider")}}),e.ipcRenderer.on("ytmView:refitPopups",async()=>{}),e.ipcRenderer.on("ytmView:executeScript",async(l,i,o)=>{const a=r[i];if(a){const c=a[o];c&&await e.webFrame.executeJavaScript(c)}}),e.ipcRenderer.send("ytmView:loaded")});
