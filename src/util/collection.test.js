/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as c from './collection'
import {assert} from 'chai'

describe('Collections', function () {
    describe('chunk', function () {
        it("Splits correctly", function () {
            const testChunks = [[1,2,3], [4,5,6], [7,8,9], [10]]

            const chunks = c.chunk([1,2,3,4,5,6,7,8,9,10], 3, (chunk, i) => {
                assert.deepEqual(testChunks[i], chunk);
            });

            assert.deepEqual(testChunks, chunks);
        });

        it("Can deal with null", function () {
            const chunks = c.chunk(null, 3, (chunk, i) => {
                assert.fail("Must not call the callback function");
            });

            assert.deepEqual(chunks, []);
        });

        it("Can deal with undefined", function () {
            const chunks = c.chunk(undefined, 3, (chunk, i) => {
                assert.fail("Must not call the callback function");
            });

            assert.deepEqual(chunks, []);
        });
    });
});