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

// Inicjalizacja SimpleLightbox
let lightbox = new SimpleLightbox('.photo-card a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  const searchQuery = event.target.elements.searchQuery.value.trim();
  if (!searchQuery) {
    return;
  }

  currentPage = 1; // reset current page
  currentQuery = searchQuery;
  gallery.innerHTML = ''; // Usunięcie poprzedniego wyniku wyszukiwania
  fetchImages(searchQuery)
    .then(data => {
      if (data.hits.length === 0) {
        throw new Error('No images found');
      }
      renderList(data.hits);
      if (data.totalHits > currentPage * 40) {
        observer.observe(loadMoreBtn);
      }
    })
    .catch(error => {
      console.error(error);
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    });
});

// loadMoreBtn.addEventListener('click', () => {
//   currentPage += 1;
//   fetchImages(currentQuery, currentPage)
//     .then(data => {
//       renderList(data.hits);
//       gallery.scrollIntoView({
//         behavior: 'smooth',
//         block: 'end',
//       });
//       if (data.totalHits <= currentPage * 40) {
//         loadMoreBtn.classList.add('is-hidden');
//         Notiflix.Notify.info(
//           "We're sorry, but you've reached the end of search results."
//         );
//       }
//     })
//     .catch(error => {
//       Notiflix.Notify.failure(
//         'Sorry, there was an error while fetching images. Please try again'
//       );
//     });
// });

const renderList = data => {
  const markup = data
    .map(
      item =>
        `<div class="photo-card"> 
        <a href="${item.largeImageURL}">
      <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy"/> 
      <div class="info"> 
        <p class="info-item"> 
          <b>Likes:</b> ${item.likes} 
        </p> 
        <p class="info-item"> 
          <b>Views:</b> ${item.views} 
        </p> 
        <p class="info-item"> 
          <b>Comments:</b> ${item.comments} 
        </p> 
        <p class="info-item"> 
          <b>Downloads:</b> ${item.downloads} 
        </p> 
      </div> 
  </div>`
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);

  // Odświeżenie SimpleLightbox dla nowych elementów
  lightbox.refresh();

  // Płynne przewijanie strony
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
