// https://towardsdatascience.com/how-to-automate-lidar-point-cloud-processing-with-python-a027454a536c

function checkData(data) {
    if (!Array.isArray(data) || !data.length) {
        throw new Error('Data: Array must be defined')
    }
}

function checkFactor(factor) {
    if (!Number.isInteger(factor)) {
        throw new Error('Factor: Must be an integer')
    }
}

function calculateMinMax(data) {
    let result = { min: [0, 0, 0], max: [0, 0, 0] }
    data.forEach(point => {
        if (point[0] < result.min[0]) {
            result.min[0] = point[0]
        }
        if (point[1] < result.min[1]) {
            result.min[1] = point[1]
        }
        if (point[2] < result.min[2]) {
            result.min[2] = point[2]
        }
        if (point[0] > result.max[0]) {
            result.max[0] = point[0]
        }
        if (point[1] > result.max[1]) {
            result.max[1] = point[1]
        }
        if (point[2] > result.max[2]) {
            result.max[2] = point[2]
        }
    })
    return result
}

function valueInRange(value, start, end) {
    return value >= start && value < end
}

function isPointInSector(point, sector) {
    return valueInRange(point[0], sector.start[0], sector.end[0])
        && valueInRange(point[1], sector.start[1], sector.end[1])
        && valueInRange(point[2], sector.start[2], sector.end[2])
}

function findPointsInSector(data, sector) {
    return data.filter(point => isPointInSector(point, sector))
}

function findBestPointInSector(data, sector) {
    const points = findPointsInSector(data, sector)
    return points.length ? points[0] : undefined
}

function axisDivisions(min, max, separation) {
    let divisions = []
    for (var i = min; i < max; i = i + separation) {
        divisions.push(i)
    }
    return divisions
}

function determineSectors(minMax, separation) {
    let sectors = []
    const xs = axisDivisions(minMax.min[0], minMax.max[0], separation)
    const ys = axisDivisions(minMax.min[1], minMax.max[1], separation)
    const zs = axisDivisions(minMax.min[2], minMax.max[2], separation)
    xs.forEach(x => {
        ys.forEach(y => {
            zs.forEach(z => {
                sectors.push({ start: [x, y, z], end: [x + separation, y + separation, z + separation] })
            })
        })
    })
    return sectors
}

function printMsg() {
    console.log('This message is from pointcloud-3d')
}

function reduceSampling(data = [], factor = 5) {
    checkData(data)
    checkFactor(factor)
    return data.filter((element, index) => index % factor == 0)
}

function reduceVoxel(data = [], separation = 0.05) {
    checkData(data)
    const minMax = calculateMinMax(data)
    const sectors = determineSectors(minMax, separation)
    let points = []
    sectors.forEach(sector => {
        const point = findBestPointInSector(data, sector)
        if (point) {
            points.push(point)
        }
    })
    return points
}

function reduceTargetSampling(data = [], size = 100) {

}

function reduceTargetVoxel(data = [], size = 100) {

}

module.exports = {
    axisDivisions,
    calculateMinMax,
    determineSectors,
    findBestPointInSector,
    findPointsInSector,
    isPointInSector,
    printMsg,
    reduceSampling,
    reduceTargetSampling,
    reduceTargetVoxel,
    reduceVoxel
};