# Maven Daemon Action 

A github action for using Maven Daemon in Github Actions. See Apache's
documentation [here](https://maven.apache.org/mvnd.html) and it's source code 
[here](https://github.com/apache/maven-mvnd)

## Usage

Add the following step to your GitHub Actions workflow to use the Maven Daemon Action:

```yaml
- name: Set up Maven Daemon
  uses: gauthamchandra/mvnd-action@v0.2.1
  with:
    # Optional: specify the version of Maven Daemon to install (default: 1.0.2)
    version: '1.0.2'
    # Optional: override the URL where mvnd binaries are hosted
    hosted-binary-url: 'https://downloads.apache.org/maven/mvnd/'
    # Optional: override the directory to save the mvnd binaries (useful for caching)
    cache-directory-override: ''
```

### Inputs

| Name                    | Description                                                                                                                        | Default                                      | Required |
|-------------------------|------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------|----------|
| `version`               | The version of Maven Daemon to install. See [available versions](https://downloads.apache.org/maven/mvnd/).                        | `1.0.2`                                      | No       |
| `hosted-binary-url`     | The URL where the mvnd binaries are hosted.                                                                                        | `https://downloads.apache.org/maven/mvnd/`   | No       |
| `cache-directory-override` | The directory to save the mvnd binaries. Useful if you want to use `actions/cache` to cache the binaries.                       | *(none)*                                     | No       |

### Outputs

| Name                         | Description                                                                 |
|------------------------------|-----------------------------------------------------------------------------|
| `cached-binary-path`         | The fully qualified path where the mvnd binary was saved.                   |
| `cached-directory-path`      | The directory containing the extracted mvnd binary and all related files. Useful for caching the entire directory with actions/cache
