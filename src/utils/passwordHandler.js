import passwordGenerator from 'generate-password'
import bcrypt from 'bcryptjs'

export const generatePassword = () => {
    return passwordGenerator.generate({
        length: 8,
        numbers: true,
        uppercase: true
    })
}

export const hashPassword = (originalPassword) => {
    const salt = bcrypt.genSaltSync(12)
    return bcrypt.hashSync(originalPassword, salt)
}

export const validatePassword = (originalHash, sendedPassword) => {
    return bcrypt.compareSync(sendedPassword, originalHash)
}