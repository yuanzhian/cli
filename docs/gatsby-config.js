module.exports = {
  siteMetadata: {
    title: 'npm command-line interface',
    shortName: 'npm-cli',
    description: 'Documentation for the npm command-line interface',
    repo: {
      url: 'https://github.com/npm/cli',
      defaultBranch: 'latest',
      path: 'docs'
    }
  },
  plugins: [
    {
      resolve: 'gatsby-theme-doctornpm',
      options: {
        icon: './src/images/npm-favicon.png'
      }
    }
  ]
}
