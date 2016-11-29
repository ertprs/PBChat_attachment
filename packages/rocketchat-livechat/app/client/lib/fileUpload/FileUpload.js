/* globals FileUpload, FileUploadBase, Slingshot */
this.FileUpload = {
	validateFileUpload(file) {
		if (file.size > FileUpload.maxFileSize) {
			throw new Meteor.Error('error-file-too-large', 'File is too large');
		}

		if (!FileUpload.fileUploadIsValidContentType(file.type)) {
			throw new Meteor.Error('error-invalid-file-type', 'File type is not accepted');
		}

		return true;
	},

	fileUploadMediaWhiteList() {
		var mediaTypeWhiteList = FileUpload.mediaTypeWhiteList;

		if (!mediaTypeWhiteList || mediaTypeWhiteList === '*') {
			return;
		}
		return _.map(mediaTypeWhiteList.split(','), function(item) {
			return item.trim();
		});
	},

	fileUploadIsValidContentType(type) {
		var list, wildCardGlob, wildcards;
		list = FileUpload.fileUploadMediaWhiteList();
		if (!list || _.contains(list, type)) {
			return true;
		} else {
			wildCardGlob = '/*';
			wildcards = _.filter(list, function(item) {
				return item.indexOf(wildCardGlob) > 0;
			});
			if (_.contains(wildcards, type.replace(/(\/.*)$/, wildCardGlob))) {
				return true;
			}
		}
		return false;
	}
};


/* globals FileUploadBase:true */
/* exported FileUploadBase */

FileUploadBase = class FileUploadBase {
	constructor(meta, file/*, data*/) {
		this.id = Random.id();
		this.meta = meta;
		this.file = file;
	}

	getProgress() {

	}

	getFileName() {
		return this.meta.name;
	}

	start() {

	}

	stop() {

	}
};

// /* Amazon S3*/
// this.FileUpload.AmazonS3 = class FileUploadAmazonS3 extends FileUploadBase {
// 	constructor(meta, file, data) {
// 		console.log('FileUpload.GridFs');
// 		super(meta, file, data);
// 		this.uploader = new Slingshot.Upload('rocketchat-uploads', { rid: meta.rid });
// 	}
// 	start() {
// 		this.uploader.send(this.file, (error, downloadUrl) => {
// 			var file, item, uploading;

// 			if (error) {
// 				uploading = Session.get('uploading');
// 				if (uploading !== null) {
// 					item = _.findWhere(uploading, {
// 						id: this.id
// 					});
// 					if (item !== null) {
// 						item.error = error.error;
// 						item.percentage = 0;
// 					}
// 					Session.set('uploading', uploading);
// 				}
// 			} else {
// 				file = _.pick(this.meta, 'type', 'size', 'name', 'identify');
// 				file._id = downloadUrl.substr(downloadUrl.lastIndexOf('/') + 1);
// 				file.url = downloadUrl;

// 				Meteor.call('sendFileMessage', this.meta.rid, 's3', file, () => {
// 					Meteor.setTimeout(() => {
// 						uploading = Session.get('uploading');
// 						if (uploading !== null) {
// 							item = _.findWhere(uploading, {
// 								id: this.id
// 							});
// 							return Session.set('uploading', _.without(uploading, item));
// 						}
// 					}, 2000);
// 				});
// 			}
// 		});
// 	}

// 	getProgress() {
// 		return this.uploader.progress();
// 	}

// 	stop() {
// 		if (this.uploader && this.uploader.xhr) {
// 			this.uploader.xhr.abort();
// 		}
// 	}
// };

/* FileSystem */
// FileSystemStore = new UploadFS.store.Local({
// 	collection: RocketChat.models.Uploads.model,
// 	name: 'fileSystem',
// 	filter: new UploadFS.Filter({
// 		onCheck: FileUpload.validateFileUpload
// 	})
// });

// FileUpload.FileSystem = class FileUploadFileSystem extends FileUploadBase {
// 	constructor(meta, file, data) {
// 		super(meta, file, data);
// 		this.handler = new UploadFS.Uploader({
// 			store: FileSystemStore,
// 			data: data,
// 			file: meta,
// 			onError: (err) => {
// 				var uploading = Session.get('uploading');
// 				if (uploading != null) {
// 					let item = _.findWhere(uploading, {
// 						id: this.id
// 					});
// 					if (item != null) {
// 						item.error = err.reason;
// 						item.percentage = 0;
// 					}
// 					return Session.set('uploading', uploading);
// 				}
// 			},
// 			onComplete: (fileData) => {
// 				var file = _.pick(fileData, '_id', 'type', 'size', 'name', 'identify');

// 				file.url = fileData.url.replace(Meteor.absoluteUrl(), '/');

// 				Meteor.call('sendFileMessage', this.meta.rid, null, file, () => {
// 					Meteor.setTimeout(() => {
// 						var uploading = Session.get('uploading');
// 						if (uploading != null) {
// 							let item = _.findWhere(uploading, {
// 								id: this.id
// 							});
// 							return Session.set('uploading', _.without(uploading, item));
// 						}
// 					}, 2000);
// 				});
// 			}
// 		});
// 	}
// 	start() {
// 		return this.handler.start();
// 	}

// 	getProgress() {
// 		return this.handler.getProgress();
// 	}

// 	stop() {
// 		return this.handler.stop();
// 	}
// };

/* GridFs */
/* globals FileUploadBase, UploadFS, FileUpload:true */
this.FileUpload.GridFS = class FileUploadGridFS extends FileUploadBase {
	constructor(meta, file) {
		super(meta, file);
        console.log('GridFS');
		if(Meteor.fileStore == undefined){
        Meteor.fileStore = new UploadFS.store.GridFS({
			  collection: new Meteor.Collection('rocketchat_uploads'),
              name: 'rocketchat_uploads',
              collectionName: 'rocketchat_uploads',
			  filter: new UploadFS.Filter({
                   onCheck: FileUpload.validateFileUpload
              }),
			  transformWrite: function(readStream, writeStream, fileId, file) {
    var identify, stream;
    if (RocketChatFile.enabled === false || !/^image\/.+/.test(file.type)) {
      return readStream.pipe(writeStream);
    }
    stream = void 0;
    identify = function(err, data) {
      var ref;
      if (err != null) {
        return stream.pipe(writeStream);
      }
      file.identify = {
        format: data.format,
        size: data.size
      };
      if ((data.Orientation != null) && ((ref = data.Orientation) !== '' && ref !== 'Unknown' && ref !== 'Undefined')) {
        return RocketChatFile.gm(stream).autoOrient().stream().pipe(writeStream);
      } else {
        return stream.pipe(writeStream);
      }
    };
    return stream = RocketChatFile.gm(readStream).identify(identify).stream();
  },
             onRead: function(fileId, file, req, res) {
    var rawCookies, ref, token, uid;
    if (RocketChat.settings.get('FileUpload_ProtectFiles')) {
      if ((req != null ? (ref = req.headers) != null ? ref.cookie : void 0 : void 0) != null) {
        rawCookies = req.headers.cookie;
      }
      if (rawCookies != null) {
        uid = cookie.get('rc_uid', rawCookies);
      }
      if (rawCookies != null) {
        token = cookie.get('rc_token', rawCookies);
      }
      if (uid == null) {
        uid = req.query.rc_uid;
        token = req.query.rc_token;
      }
      if (!(uid && token && RocketChat.models.Users.findOneByIdAndLoginToken(uid, token))) {
        res.writeHead(403);
        return false;
      }
    }
    res.setHeader('content-disposition', "attachment; filename=\"" + (encodeURIComponent(file.name)) + "\"");
    return true;
  }
        });
		}
        console.log('Meteor.fileStore');
		this.handler = new UploadFS.Uploader({
			store: Meteor.fileStore,
			data: file,
			file: meta,
			onError: (err) => {
				var uploading = Session.get('uploading');
				if (uploading != null) {
					let item = _.findWhere(uploading, {
						id: this.id
					});
					if (item != null) {
						item.error = err.reason;
						item.percentage = 0;
					}
					return Session.set('uploading', uploading);
				}
			},
			onComplete: (fileData) => {
				var file = _.pick(fileData, '_id', 'type', 'size', 'name', 'identify');

				file.url = fileData.url.replace(Meteor.absoluteUrl(), '/');

				Meteor.call('sendFileMessage', this.meta.rid, null, file, () => {
					Meteor.setTimeout(() => {
						var uploading = Session.get('uploading');
						if (uploading != null) {
							let item = _.findWhere(uploading, {
								id: this.id
							});
							return Session.set('uploading', _.without(uploading, item));
						}
					}, 2000);
				});
			}
		});

		this.handler.onProgress = (file, progress) => {
			this.onProgress(progress);
		};
	}

	start() {
		const uploading = Session.get('uploading') || [];
		const item = {
			id: this.id,
			name: this.getFileName(),
			percentage: 0
		};
		uploading.push(item);
		Session.set('uploading', uploading);
		return this.handler.start();
	}

	onProgress() {}

	stop() {
		return this.handler.stop();
	}
};
