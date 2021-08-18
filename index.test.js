const got = require('got')
const stream = require('stream');
const { promisify } = require('util');
const pipeline = promisify(stream.pipeline);
const fs = require('fs')
const tar = require('tar')
const pointCloudConvert = require('point-cloud-convert')

const { axisDivisions, calculateMinMax, determineSectors, findPointsInSector, isPointInSector, reduceSampling, reduceVoxel } = require('./index')

let data = []

function divisionCount(min, max, separation) {
    return Math.ceil((max - min) / separation)
}

const loadData = async () => {
    var dir = './data'
    var pathZipped = './data/bunny.tar.gz'
    var pathUnzipped = './data/bunny'
    var pathAsc = './data/bunny.asc'
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }
    if (!fs.existsSync(pathZipped)) {
        // http://graphics.stanford.edu/data/3Dscanrep/        
        await pipeline(
            got.stream('http://graphics.stanford.edu/pub/3Dscanrep/bunny.tar.gz'),
            fs.createWriteStream(pathZipped)
        )
    }
    if (!fs.existsSync(pathUnzipped)) {
        await tar.extract({
            file: pathZipped,
            cwd: dir
        })
        const data = fs.readFileSync(pathUnzipped + "/data/bun000.ply", "utf8");
        let outputStr = pointCloudConvert(data, 'ply2asc')
        fs.writeFileSync(pathAsc, outputStr);
    }
    if (fs.existsSync(pathAsc)) {
        fs.readFileSync(pathAsc, 'utf-8').split(/\r?\n/).forEach((line) => {
            const parts = line.split(' ')
            data.push([Number(parts[0]), Number(parts[1]), Number(parts[2])]);
        })
    }
}

beforeAll(async () => {
    await loadData()
})

describe('calculateMinMax', () => {
    test('Test min max', () => {
        const data = [[2, 4, 8], [-6, 3, -1], [6, -4, -5]]
        const minMax = calculateMinMax(data)
        expect(minMax).toEqual({ min: [-6, -4, -5], max: [6, 4, 8] })
    })
    test('Test min max rabbit data', () => {
        const minMax = calculateMinMax(data)
        expect(minMax).toEqual({ min: [-0.09475, 0, -0.0586982], max: [0.061, 0.18794, 0.0587228] })
    })
})

describe('axisDivisions', () => {
    test('Test divisions', () => {
        const separation = 0.01
        const min = -0.09475
        const max = 0.061
        const prediction = divisionCount(min, max, separation)
        const divisions = axisDivisions(min, max, separation)
        expect(divisions.length).toEqual(prediction)
    })
})

describe('determineSectors', () => {
    test('Test sectors', () => {
        const separation = 0.01
        const minMax = calculateMinMax(data)
        const prediction = divisionCount(minMax.min[0], minMax.max[0], separation) * divisionCount(minMax.min[1], minMax.max[1], separation) * divisionCount(minMax.min[2], minMax.max[2], separation)
        const sectors = determineSectors(minMax, separation)
        expect(sectors.length).toEqual(prediction)
    })
})

describe('isPointInSector', () => {
    test('Test point not in sector', () => {
        const result = isPointInSector([1.5, 0.5, 0.5], { start: [0, 0, 0], end: [1, 1, 1] })
        expect(result).toEqual(false)
    })
    test('Test point in sector', () => {
        const result = isPointInSector([0.5, 0.5, 0.5], { start: [0, 0, 0], end: [1, 1, 1] })
        expect(result).toEqual(true)
    })
})

describe('findPointsInSector', () => {
    test('Test one point is in sector', () => {
        const result = findPointsInSector([[0.5, 0.5, 0.5], [1.5, 0.5, 0.5]], { start: [0, 0, 0], end: [1, 1, 1] })
        expect(result.length).toEqual(1)
    })
})

describe('Reduce sampling', () => {
    test('Should not allow empty array', () => {
        expect(() => reduceSampling()).toThrow('Data: Array must be defined')
    })
    test('Should not allow empty factor', () => {
        expect(() => reduceSampling(data, null)).toThrow('Factor: Must be an integer')
    })
    test('Should return reduced sample', () => {
        const prediction = Math.ceil(data.length / 5)
        const points = reduceSampling(data, 5)
        expect(points.length).toEqual(prediction)
    })
})

describe('Reduce voxel grid', () => {
    test('Should not allow empty array', () => {
        expect(() => reduceVoxel()).toThrow('Data: Array must be defined')
    })
    test('Should return voxel sample', () => {
        const points = reduceVoxel(data, 0.01)
        expect(points.length).toEqual(392)
    })
})