import './css/styles.css';
import { fetchImages } from './fetchImages';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let currentPage = 1;
let currentQuery = '';

// Creates a new instance of SimpleLightbox and applies it to all anchor elements inside elements with the "photo-card" class, using alt text as captions with a delay of 250ms.
let lightbox = new SimpleLightbox('.photo-card a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});

/*
  The searchForm event listener is triggered when the user submits the search form. 
  It prevents the default form submission behavior, gets the search query value,
  resets the current page to 1, clears the gallery content, and fetches images based on the search query. 
  If no images are found, it displays an error message using Notiflix. 
  Otherwise, it renders the list of images and shows the load more button.
*/
searchForm.addEventListener('submit', event => {
  event.preventDefault();
  const searchQuery = event.target.elements.searchQuery.value.trim(); // Extracts the search query value from the form
  if (!searchQuery) {
    // Checks if the search query is empty
    return;
  }

  currentPage = 1; // Resets the current page number to 1
  currentQuery = searchQuery; // Sets the current search query to the extracted value
  gallery.innerHTML = ''; // Clears the previous search results from the gallery container
  fetchImages(searchQuery)
    .then(data => {
      if (data.hits.length === 0) {
        throw new Error('No images found');
      }
      renderList(data.hits); // Renders the fetched images to the gallery container
      loadMoreBtn.classList.remove('is-hidden'); // Shows the load more button

      /*
        This code checks if the total number of hits returned by the API is greater than the current page multiplied by 40. 
        If it is, then it attaches an observer to the "Load More" button to detect when the button is visible on the screen. 
        Once the button is visible, it triggers the function to load more images from the API. Removing the comment will enable this functionality.
      */

      // if (data.totalHits > currentPage * 40) {
      //   observer.observe(loadMoreBtn);
      // }
    })
    .catch(error => {
      console.error(error);
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    });
});

/*
  The loadMoreBtn event listener function is responsible for loading additional images in response to the user clicking the "load more" button. 
  When the button is clicked, the currentPage variable is incremented by 1, and the fetchImages() function is called with the current search query and page number as arguments.

  If the API call is successful, the new images are appended to the gallery container using the renderList() function. 
  The gallery.scrollIntoView() method is then used to smoothly scroll the user to the bottom of the page where the newly loaded images are located.

  If the total number of search results is less than or equal to currentPage * 40, 
  meaning all the available results have been loaded, the "load more" button is hidden, 
  and the user is notified with an info message using the Notiflix.Notify.info() function.

  If there is an error during the API call, the user is notified with an error message using the Notiflix.Notify.failure() function.

  Overall, this function allows the user to load more images and scroll through the results, improving the user experience of the search feature.
 */
loadMoreBtn.addEventListener('click', () => {
  currentPage += 1;
  fetchImages(currentQuery, currentPage)
    .then(data => {
      renderList(data.hits);
      gallery.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
      if (data.totalHits <= currentPage * 40) {
        loadMoreBtn.classList.add('is-hidden');
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      }
    })
    .catch(error => {
      Notiflix.Notify.failure(
        'Sorry, there was an error while fetching images. Please try again'
      );
    });
});

/*
  The renderList function takes the response data from an API call and renders it to the gallery. 
  The function creates a markup string by mapping through the data and using the image properties to create HTML elements for each image. 
  It then inserts the markup into the gallery element using the insertAdjacentHTML method.

  After inserting the HTML, the function refreshes the SimpleLightbox to ensure that any new images are included in the lightbox. 
  Finally, the function smooth scrolls the page down to display the newly added images.

  Overall, this function takes care of rendering new images to the gallery and ensures that the SimpleLightbox is up-to-date with the latest images.
*/
const renderList = data => {
  const markup = data
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<div class="photo-card"> 
        <a href="${largeImageURL}">
      <img src="${webformatURL}" alt="${tags}" loading="lazy"/> 
      <div class="info"> 
        <p class="info-item"> 
          <b>Likes:</b> ${likes} 
        </p> 
        <p class="info-item"> 
          <b>Views:</b> ${views} 
        </p> 
        <p class="info-item"> 
          <b>Comments:</b> ${comments} 
        </p> 
        <p class="info-item"> 
          <b>Downloads:</b> ${downloads} 
        </p> 
      </div> 
  </div>`
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);

  // Refreshes the SimpleLightbox for new elements
  lightbox.refresh();

  // Enables smooth scrolling by scrolling the page by twice the height of the first gallery element
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
};

const options = {
  rootMargin: '0px',
  threshold: 0.5,
};

/*
  This function creates an IntersectionObserver that observes whether the "load more" button is in view and triggers a fetchImages function to load more images when it is. 
  The observer is initialized with options that define the root margin and threshold for triggering the intersection. 
  When the button is in view, the currentPage variable is incremented and a new fetchImages call is made with the current search query and current page number. 
  If there are no more images to load, the observer stops observing the button and notifies the user that they have reached the end of the search results. 
  If there is an error while fetching images, the user is notified with an error message. 
  
  !! The observer is activated by removing the comment from the searchForm.addEventListener function, which is where it is attached to the loadMoreBtn element. !!
*/
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      currentPage += 1;
      fetchImages(currentQuery, currentPage)
        .then(data => {
          renderList(data.hits);
          if (data.totalHits <= currentPage * 40) {
            loadMoreBtn.classList.add('is-hidden');
            Notiflix.Notify.info(
              "We're sorry, but you've reached the end of search results."
            );
            observer.unobserve(entry.target);
          }
        })
        .catch(error => {
          Notiflix.Notify.failure(
            'Sorry, there was an error while fetching images. Please try again'
          );
        });
    }
  });
}, options);
