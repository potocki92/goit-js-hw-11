import Notiflix from 'notiflix';

/*
  The fetchImages function fetches images from the Pixabay API based on a given search query and displays notifications using the Notiflix library. 
  It takes in parameters for the search query, page number, and number of images per page, and returns a promise that resolves with the image data or rejects with an error.
*/

const fetchImages = (name, page = 1, perPage = 40) => {
  const url = `https://pixabay.com/api/?key=34880786-eb7cfd58b108d519b70562252&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;
  Notiflix.Notify.info(`Fetching images for "${name}"...`);
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        if (response.status === 429) {
          // Too Many Requests
          Notiflix.Notify.warning('Too many requests. Please try again later.');
        }
        return Promise.reject(new Error(response.status));
      }
      return response.json();
    })
    .then(data => {
      const totalHits = data.totalHits;
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
      return data;
    })
    .catch(error => {
      console.error(error);
      return Promise.reject(
        new Error('An error occurred while fetching the data.')
      );
    });
};

export { fetchImages };
