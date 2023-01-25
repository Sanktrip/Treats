import sharp from 'sharp';
import { url, port } from './config.json';
import request from 'sync-request';
import fs from 'fs';
import path from 'path';
import { validateToken } from './tokens';
import HTTPError from 'http-errors';
import { getData, setData, dataTYPE } from './dataStore';
import sizeOf from 'image-size';

const BAD_REQUEST = 400;

const timeouts: ReturnType<typeof setTimeout>[] = [];

/**
 * takes an image URL, downloads and crops it, the n
 * @param token
 * @param imgUrl
 * @param xStart
 * @param yStart
 * @param xEnd
 * @param yEnd
 */
function uploadPhotoV1(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) {
  const authUserId = validateToken(token);
  // const DEFAULT_PROFILE_URL = `${url}:${port}/profileImgs/default.jpg`;
  const dir = './src/profileImgs';
  const fileCount = fs.readdirSync(dir).length;
  // fs.readdir(dir, (err, files) => {
  //   fileCount = files.length + 1;
  // });

  if ((xEnd <= xStart) || (yEnd <= yStart)) {
    throw HTTPError(BAD_REQUEST, 'x/y values invalid');
  }
  // get image off the internet by it's URL
  let res;
  try {
    res = request(
      'GET',
      imgUrl
    );
  } catch (e) {
    throw HTTPError(BAD_REQUEST, 'Issue with fetching imgUrl');
  }
  const body = res.getBody();

  // save that image
  const tempImgPath = `src/profileImgs/${fileCount}.TEMP`;
  const imgPath = `src/profileImgs/${fileCount}.jpg`;
  fs.writeFileSync(tempImgPath, body);

  const dimensions = sizeOf(tempImgPath);
  if ((xEnd > dimensions.width) || (yEnd > dimensions.height)) {
    throw HTTPError(BAD_REQUEST, 'error saving - x/y values likely out of range');
  }
  console.log(dimensions.width, dimensions.height);

  // crop the image using Sharp
  sharp(tempImgPath).extract({ width: xEnd - xStart, height: yEnd - yStart, left: xStart, top: yStart }).toFile(imgPath)
    .then(function(newFileInfo) {
      console.log('Image cropped and saved');
    });
  // .catch(function(err) {
  //   console.log('An error occured cropping the image');
  // });

  // delete the temporary img file after a second
  const timeout = setTimeout(() => {
    fs.unlinkSync(tempImgPath);
  }, 5000);
  timeouts.push(timeout);

  // update userData to include new image
  const dataStore: dataTYPE = getData();
  const email = Object.keys(dataStore.users).find(key => dataStore.users[key].uId === authUserId);
  dataStore.users[email].profileImgUrl = `${url}:${port}/src/profileImgs/${fileCount}.jpg`;
  setData(dataStore);
}

/**
 * clears all photos from dataStore expect default photo
 *
 * ARGUMENTS:
 * none
 *
 * RETURN VALUES:
 * none
 *
 * ERRORS:
 * @throws {500} if error accessing image directory
 * @throws {500} if error removing image
 */
function clearPhotos() {
  const dir = './src/profileImgs';
  const def = 'default.jpg';

  fs.readdir(dir, (err, files) => {
    for (const image of files) {
      if (image !== def) {
        fs.unlinkSync(path.join(dir, image));
      }
    }
  });
}

/**
 * clears all timeouts created by uploadPhotoV1
 *
 * ARGUMENTS:
 * none
 *
 * RETURN VALUES:
 * none
 */
function clearPhotosTimeout() {
  for (const timeout of timeouts) {
    clearTimeout(timeout);
  }
}

export { uploadPhotoV1, clearPhotos, clearPhotosTimeout };
