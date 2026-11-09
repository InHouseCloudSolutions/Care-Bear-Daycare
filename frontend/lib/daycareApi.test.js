import {
  createSiteImage,
  deleteSiteImage,
  fetchBookingPreview,
  listServices,
  listSiteImages,
  replaceSiteImage,
  updateSiteImage,
} from './daycareApi';

describe('site image client', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '[]',
    });
  });

  it('lists a placement with the slash before the query and no token', async () => {
    await listSiteImages('home_slide');
    expect(fetch).toHaveBeenCalledWith(
      '/daycare-api/daycare/site-images/?placement=home_slide',
      expect.objectContaining({ method: 'GET', credentials: 'omit' }),
    );
    const [, options] = fetch.mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
  });

  it('posts file, alt, and placement as multipart with the staff token', async () => {
    const file = new File(['x'], 'dog.jpg', { type: 'image/jpeg' });
    await createSiteImage('tok', { file, alt: 'Dog', placement: 'gallery' });
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('/daycare-api/daycare/site-images');
    expect(options.method).toBe('POST');
    expect(options.headers.Authorization).toBe('Token tok');
    expect(options.headers['Content-Type']).toBeUndefined();
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get('alt')).toBe('Dog');
    expect(options.body.get('placement')).toBe('gallery');
    expect(options.body.get('file').name).toBe('dog.jpg');
  });

  it('posts only the file when replacing a photo', async () => {
    const file = new File(['x'], 'dog.jpg', { type: 'image/jpeg' });
    await replaceSiteImage('tok', 4, file);
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('/daycare-api/daycare/site-images/4/photo');
    expect(options.method).toBe('POST');
    expect(options.headers.Authorization).toBe('Token tok');
    expect(options.headers['Content-Type']).toBeUndefined();
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get('file').name).toBe('dog.jpg');
    expect(options.body.get('alt')).toBeNull();
    expect(options.body.get('placement')).toBeNull();
  });

  it('asks for every service when staff include hidden ones', async () => {
    await listServices('tok');
    await listServices('tok', { all: true });
    expect(fetch.mock.calls[0][0]).toBe('/daycare-api/daycare/services/');
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Token tok');
    expect(fetch.mock.calls[1][0]).toBe('/daycare-api/daycare/services/?all=1');
  });

  it('loads a booking preview as HTML with the token only in the header', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => '<html><body>Invoice</body></html>',
    });
    const res = await fetchBookingPreview('staff-token', 10, 'invoice');
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('/daycare-api/daycare/bookings/10/previews/invoice');
    expect(url).not.toContain('staff-token');
    expect(options.method).toBe('GET');
    expect(options.credentials).toBe('omit');
    expect(options.headers.Authorization).toBe('Token staff-token');
    expect(res).toEqual({
      ok: true,
      status: 200,
      data: '<html><body>Invoice</body></html>',
    });
  });

  it('patches alt and sort order, and deletes by id', async () => {
    await updateSiteImage('tok', 4, { alt: 'Dog', sort_order: 1 });
    await deleteSiteImage('tok', 4);
    expect(fetch.mock.calls[0][0]).toBe('/daycare-api/daycare/site-images/4/');
    expect(fetch.mock.calls[0][1].method).toBe('PATCH');
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ alt: 'Dog', sort_order: 1 });
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Token tok');
    expect(fetch.mock.calls[1][0]).toBe('/daycare-api/daycare/site-images/4/');
    expect(fetch.mock.calls[1][1].method).toBe('DELETE');
  });
});
