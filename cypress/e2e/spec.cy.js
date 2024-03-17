import user from '../fixtures/user.json'
import post from '../fixtures/user.json'
import {faker} from "@faker-js/faker";

post.id = faker.number.int()
user.email = faker.internet.email()
user.password = faker.internet.password({length: 20, memorable: true, pattern: /[A-Z]/, prefix: 'Hello '})

describe('API tests', () => {

    it('1.Get all posts. Verify HTTP response status code and content type', () => {
        cy.request({
            method: 'GET',
            url: '/posts',
            headers: {}
        }).then(response => {
            expect(response.status).to.equal(200);
            expect(response.headers['content-type']).to.include('application/json');
        });
    });

    it('2.Get only first 10 posts. Verify HTTP response status code. Verify that only first posts are returned', () => {
        cy.request({
            method: 'GET',
            url: '/posts',
            headers: {}
        }).then(response => {
            expect(response.status).to.equal(200);
            const first10Posts = response.body.slice(0, 10);
            expect(first10Posts.length).to.equal(10);
        });
    });

    it('3.Get posts with id = 55 and id = 60. Verify HTTP response status code. Verify id values of returned records.', () => {
        cy.request({
            method: 'GET',
            url: '/posts',
            headers: {}
        }).then(response => {

            expect(response.status).to.equal(200);


            const post55 = response.body.find(post => post.id === 55);
            const post60 = response.body.find(post => post.id === 60);


            expect(post55.id).to.equal(55);
            expect(post60.id).to.equal(60);
        });
    });

    it('4.Create a post. Verify HTTP response status code.', () => {
        cy.request({
            method: 'POST',
            url: '/664/posts',
            headers: {},
            body: {
                title: 'EXAM PART 2',
                body: 'TEST',
            },
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.equal(401);
        });
    });

    it('5.Create post with adding access token in header. Verify HTTP response status code. Verify post is created', () => {
        cy.log('register user');
        let accessToken
        cy.request({
            method: 'POST',
            url: '/register',
            body: {
                email: user.email,
                password: user.password
            }
        }).then((registerResponse) => {
            expect(registerResponse.status).to.equal(201);
            accessToken = registerResponse.body.accessToken;


            cy.request({
                method: 'POST',
                url: '/664/posts',
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                body: {
                    title: 'Post by Viktoria',
                    body: 'New Post',
                },
            }).then((postResponse) => {
                expect(postResponse.status).to.equal(201);
            });
        });
    });

    it('6.Create post entity and verify that the entity is created. Verify HTTP response status code. Use JSON in body', () => {

        cy.request({
            method: 'POST',
            url: '/posts',
            body: {
                title: 'Post by Viktoria',
                body: 'Post entity',
                userId: 1
            }
        }).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.title).to.equal('Post by Viktoria');
            expect(response.body.body).to.equal('Post entity');
            expect(response.body.userId).to.equal(1);
        });
    });

    it('7.Update non-existing entity. Verify HTTP response status code', () => {

        cy.request({
            method: 'PUT',
            url: '/posts/100000',
            body: {
                title: 'Updated Title',
                body: 'Updated content.',
                userId: 1
            },
            failOnStatusCode: false
        }).then(response => {

            expect(response.status).to.equal(404);
        });
    });

    it('8.Create post entity and update the created entity. Verify HTTP response status code and verify that the entity is updated.', () => {
        let postId;
        cy.request({
            method: 'POST',
            url: '/posts',
            body: {
                title: 'Post by Viktoria',
                body: 'Viktoria entity post',
                userId: 1
            }
        }).then(response => {
            expect(response.status).to.equal(201);
            expect(response.body.title).to.equal('Post by Viktoria');
            expect(response.body.body).to.contain('Viktoria entity post');
            expect(response.body.userId).to.equal(1);

            postId = response.body.id;


            cy.request({
                method: 'PUT',
                url: `/posts/${postId}`,
                body: {
                    title: 'Updated by Viktoria',
                    body: 'Updated test post entity',
                    userId: 1
                }
            }).then(updateResponse => {
                expect(updateResponse.status).to.equal(200);
                expect(updateResponse.body.title).to.equal('Updated by Viktoria');
                expect(updateResponse.body.body).to.contain('Updated test post entity');
                expect(updateResponse.body.userId).to.equal(1);
            });
        });
    });

    it('9.Delete non-existing post entity. Verify HTTP response status code', () => {
        cy.request({
            method: 'DELETE',
            url: '/posts/1000',
            failOnStatusCode: false
        }).then(response => {
            expect(response.status).to.equal(404);
        });
    });

    it('10.Create post entity, update the created entity, and delete the entity. Verify HTTP response status code and verify that the entity is deleted.', () => {
        let postId;
        cy.request({
            method: 'POST',
            url: '/posts',
            body: {
                title: 'Post by Viktoria',
                body: 'Test post entity.',
                userId: 1
            }
        }).then(createResponse => {

            expect(createResponse.status).to.equal(201);
            postId = createResponse.body.id;

            cy.request({
                method: 'PUT',
                url: `/posts/${postId}`,
                body: {
                    title: 'Updated Test Post',
                    body: 'This is an updated test post entity.',
                    userId: 1
                }
            }).then(updateResponse => {

                expect(updateResponse.status).to.equal(200);
                expect(updateResponse.body.title).to.equal('Updated Test Post');
                expect(updateResponse.body.body).to.equal('This is an updated test post entity.');
                expect(updateResponse.body.userId).to.equal(1);


                cy.request({
                    method: 'DELETE',
                    url: `/posts/${postId}`,
                    failOnStatusCode: false
                }).then(deleteResponse => {
                    expect(deleteResponse.status).to.equal(200);


                    cy.request({
                        method: 'GET',
                        url: `/posts/${postId}`,
                        failOnStatusCode: false
                    }).then(getResponse => {
                        expect(getResponse.status).to.equal(404);
                    });
                });
            });
        });
    });
});


